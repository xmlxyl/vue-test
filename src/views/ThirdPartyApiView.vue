<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import {
  buildCreateUpsertBody,
  buildUpdateUpsertBody,
  createShopifyStore,
  deleteShopifyStore,
  fetchShopifyStores,
  updateShopifyStore,
  type SetAsDefaultMode,
  type ShopifyStoreListItem,
} from '@/api/shopify'

const loading = ref(false)
const tableData = ref<ShopifyStoreListItem[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const dialogSubmitting = ref(false)
const editingId = ref<string | number | null>(null)

const formRef = ref<FormInstance>()

const form = reactive({
  shop: '',
  accessToken: '',
  /** 留空则提交时不带 apiVersion，由后端使用默认 2024-10 */
  apiVersion: '',
  /** 与 UpsertRequest 中「不传 / true / false」对应 */
  setAsDefaultMode: 'auto' as SetAsDefaultMode,
})

const rules: FormRules = {
  shop: [{ required: true, message: '请输入 shop', trigger: 'blur' }],
  accessToken: [
    {
      validator: (_rule, value, callback) => {
        if (dialogMode.value === 'create' && !String(value || '').trim()) {
          callback(new Error('请输入 accessToken'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

function formatDateTime(val?: string | null): string {
  if (val == null || val === '') return '—'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  return d.toLocaleString('zh-CN', { hour12: false })
}

async function loadTable() {
  loading.value = true
  try {
    tableData.value = await fetchShopifyStores()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '加载列表失败')
    tableData.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTable()
})

function openCreate() {
  dialogMode.value = 'create'
  editingId.value = null
  form.shop = ''
  form.accessToken = ''
  form.apiVersion = ''
  form.setAsDefaultMode = 'auto'
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function openEdit(row: ShopifyStoreListItem) {
  dialogMode.value = 'edit'
  editingId.value = row.id
  form.shop = row.shopHost
  form.accessToken = ''
  form.apiVersion = row.apiVersion ?? ''
  form.setAsDefaultMode = row.defaultStore ? 'yes' : 'no'
  dialogVisible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

async function submitDialog() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  dialogSubmitting.value = true
  try {
    if (dialogMode.value === 'create') {
      const body = buildCreateUpsertBody({
        shop: form.shop,
        accessToken: form.accessToken,
        apiVersion: form.apiVersion,
        setAsDefaultMode: form.setAsDefaultMode,
      })
      await createShopifyStore(body)
      ElMessage.success('新增成功')
    } else if (editingId.value != null) {
      const body = buildUpdateUpsertBody({
        shop: form.shop,
        accessToken: form.accessToken,
        apiVersion: form.apiVersion,
        setAsDefaultMode: form.setAsDefaultMode,
      })
      await updateShopifyStore(editingId.value, body)
      ElMessage.success('保存成功')
    }
    dialogVisible.value = false
    await loadTable()
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '操作失败')
  } finally {
    dialogSubmitting.value = false
  }
}

function handleDelete(row: ShopifyStoreListItem) {
  ElMessageBox.confirm(`确定删除店铺「${row.shopHost}」吗？`, '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteShopifyStore(row.id)
        ElMessage.success('已删除')
        await loadTable()
      } catch (e) {
        ElMessage.error(e instanceof Error ? e.message : '删除失败')
      }
    })
    .catch(() => {})
}
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <h1 class="title">第三方 API 管理</h1>
      <el-button type="primary" :icon="Plus" @click="openCreate">新增店铺</el-button>
    </div>
    <p class="hint">
      列表为 <code>ShopifyStoreVO</code>；提交为 <code>ShopifyStoreUpsertRequest</code>（
      <code>shop</code>、<code>accessToken</code>、可选 <code>apiVersion</code>、可选
      <code>setAsDefault</code>）
    </p>

    <el-table
      v-loading="loading"
      :data="tableData"
      stripe
      border
      style="width: 100%"
      empty-text="暂无数据"
    >
      <el-table-column prop="shopHost" label="店铺域名" min-width="200" show-overflow-tooltip />
      <el-table-column prop="apiVersion" label="API Version" width="120" />
      <el-table-column label="默认店铺" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.defaultStore ? 'success' : 'info'" size="small">
            {{ row.defaultStore ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Access Token（脱敏）" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.accessTokenMasked ?? '—' }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="170" show-overflow-tooltip>
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="170" show-overflow-tooltip>
        <template #default="{ row }">
          {{ formatDateTime(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link :icon="Edit" @click="openEdit(row)">编辑</el-button>
          <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增店铺' : '编辑店铺'"
      width="560px"
      destroy-on-close
      @closed="() => formRef?.clearValidate()"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="132px">
        <el-form-item label="shop" prop="shop">
          <el-input
            v-model="form.shop"
            placeholder="https://xxx.myshopify.com 或 xxx.myshopify.com"
            clearable
          />
        </el-form-item>
        <el-form-item label="accessToken" prop="accessToken">
          <el-input
            v-model="form.accessToken"
            type="password"
            show-password
            autocomplete="off"
            placeholder="shpat_xxx"
            clearable
          />
          <div v-if="dialogMode === 'edit'" class="form-tip">留空表示不修改 Token</div>
        </el-form-item>
        <el-form-item label="apiVersion">
          <el-input v-model="form.apiVersion" placeholder="留空则提交时不传，后端默认 2024-10" clearable />
        </el-form-item>
        <el-form-item label="setAsDefault">
          <el-radio-group v-model="form.setAsDefaultMode" class="radio-block">
            <el-radio value="auto">自动（不传该字段，由后端规则决定）</el-radio>
            <el-radio value="yes">设为默认店铺</el-radio>
            <el-radio value="no">不设为默认</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogSubmitting" @click="submitDialog">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.hint {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
}

.hint code {
  font-size: 0.78rem;
}

.form-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.radio-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}
</style>
