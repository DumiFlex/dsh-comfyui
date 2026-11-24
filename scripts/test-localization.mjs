import assert from 'node:assert/strict'
import { makeT } from '../src/client/i18n.ts'
import { analyzeWorkflowParameters, applyWorkflowParameters } from '../lib/params.js'
import { extractedWorkflowText, hasWorkflowTag, parameterLabel, PRESET_TAGS, tagLabel } from '../lib/workflow-localization.js'

const workflow = {
  1: { class_type: 'CLIPTextEncode', inputs: { text: '排除内容' } },
  2: { class_type: 'CLIPTextEncode', inputs: { text: '一只猫' } },
  3: { class_type: 'KSampler', inputs: { positive: ['2', 0], negative: ['1', 0], steps: 8, seed: 7 } },
  4: { class_type: 'EmptyLatentImage', inputs: { width: 512, height: 768 } },
}
const params = analyzeWorkflowParameters(workflow)
assert.deepEqual(params.map(({ name }) => name), ['prompt', 'prompt_2', 'steps', 'seed', 'width', 'height'])
const expected = {
  en: ['Negative prompt', 'Prompt', 'Sampling steps', 'Random seed', 'Width', 'Height'],
  zh: ['负面提示词', '提示词', '采样步数', '随机种子', '宽度', '高度'],
}
for (const lang of ['en', 'zh']) {
  assert.equal(makeT(lang)('language'), lang === 'en' ? 'Language' : '界面语言')
  assert.deepEqual(params.map(({ label }) => parameterLabel(label, lang)), expected[lang])
  const fixtures = [{ tags: ['文生图', '自定义'] }, { tags: ['图生图'] }, {}]
  assert.deepEqual(fixtures.filter((entry) => hasWorkflowTag(entry, PRESET_TAGS[1])), [fixtures[0]])
  assert.equal(tagLabel(PRESET_TAGS[1], lang), lang === 'en' ? 'Text to image' : '文生图')
  assert.equal(tagLabel('自定义', lang), '自定义')
}
assert.equal(parameterLabel('随机种子', 'en'), 'Random seed')
assert.equal(parameterLabel('主角名字', 'en'), '主角名字')

const legacy = { source: 'comfyui', name: 'Example · 分量2（渲染）', description: '从 ComfyUI 图工作流 Example.json 提取第 2 个分量（4 节点）（渲染）。' }
const english = extractedWorkflowText(legacy, 'en')
assert.deepEqual(english, {
  name: 'Example · Component 2 (渲染)',
  description: 'Extracted component 2 (4 nodes) from the ComfyUI graph Example.json (渲染).',
})
assert.deepEqual(extractedWorkflowText({ ...legacy, ...english }, 'zh'), { name: legacy.name, description: legacy.description })
assert.equal(extractedWorkflowText({ name: 'Example（导入 2）' }, 'en').name, 'Example (Imported 2)')

assert.equal(extractedWorkflowText({ name: legacy.name + '（导入）', description: legacy.description }, 'en').name, english.name + ' (Imported)')

const legacyParams = params.map((param, i) => ({ ...param, label: expected.zh[i] }))
const values = { prompt_2: '新提示词', seed: 42, width: 1024 }
assert.deepEqual(applyWorkflowParameters(workflow, params, values), applyWorkflowParameters(workflow, legacyParams, values))
const run = applyWorkflowParameters(workflow, legacyParams, values)
assert.equal(run[1].inputs.text, '排除内容')
assert.equal(run[2].inputs.text, '新提示词')
assert.equal(run[3].inputs.seed, 42)
assert.equal(run[4].inputs.width, 1024)
assert.equal(workflow[2].inputs.text, '一只猫')
console.log('Workflow localization checks passed')
