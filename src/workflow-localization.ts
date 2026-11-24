export type WorkflowLanguage = 'en' | 'zh'

// Preset tag IDs are the original stored strings. Filter and save by ID.
const tags = {
  图生图: 'Image to image',
  文生图: 'Text to image',
  文生视频: 'Text to video',
  图生视频: 'Image to video',
  参考生视频: 'Reference to video',
  文生音频: 'Text to audio',
  参考生音频: 'Reference to audio',
}
export const PRESET_TAGS = Object.keys(tags)

const labels = {
  文本: 'Text',
  提示词: 'Prompt',
  负面提示词: 'Negative prompt',
  宽度: 'Width',
  高度: 'Height',
  种子: 'Seed',
  采样步数: 'Sampling steps',
  步数: 'Steps',
  随机种子: 'Random seed',
  图片: 'Image',
  视频: 'Video',
  音频: 'Audio',
  宽高比: 'Aspect ratio',
  尺寸: 'Size',
  时长: 'Duration',
}

export function parameterLabel(label: string, lang: WorkflowLanguage): string {
  const known = Object.entries(labels).find(([zh, en]) => label === zh || label === en)
  return known?.[lang === 'zh' ? 0 : 1] ?? label
}

export function tagLabel(tag: string, lang: WorkflowLanguage): string {
  return lang === 'en' && Object.hasOwn(tags, tag) ? tags[tag as keyof typeof tags] : tag
}

export function hasWorkflowTag(workflow: { tags?: string[] }, tag: string): boolean {
  return workflow.tags?.includes(tag) ?? false
}

export function workflowDisplayName(name: string, lang: WorkflowLanguage): string {
  return lang === 'en' ? name.replace(/（导入(?: (\d+))?）$/, (_, index) => ` (Imported${index ? ` ${index}` : ''})`) : name
}

export function extractedWorkflowText(workflow: {
  name: string
  description?: string
  source?: string
}, lang: WorkflowLanguage): { name: string; description: string } {
  const { source, description = '' } = workflow
  // Preset archives from older versions omit the source marker.
  const generated = source === 'comfyui' || /^从 ComfyUI 图工作流 |^Extracted .* from the ComfyUI graph /.test(description)
  if (!generated) return { name: workflowDisplayName(workflow.name, lang), description }
  const suffix = workflow.name.match(/（导入(?: \d+)?）$/)?.[0] ?? ''
  const name = workflow.name.slice(0, workflow.name.length - suffix.length)
  if (lang === 'en') {
    return {
      name: workflowDisplayName(name.replace(/ · 主流程$/, ' · Main flow')
        .replace(/ · 分量(\d+)(?:（(.*)）)?$/, (_, index, groups) => ` · Component ${index}${groups ? ` (${groups})` : ''}`) + suffix, lang),
      description: description
        .replace(/^从 ComfyUI 图工作流 (.+) 整体提取：(\d+) 个分量合成一个运行工作流。$/, 'Extracted $2 components from the ComfyUI graph $1 into one runnable workflow.')
        .replace(/^从 ComfyUI 图工作流 (.+) 提取主流程（(\d+) 节点）(?:（(.*)）)?。$/, (_, file, size, groups) => `Extracted the main flow (${size} nodes) from the ComfyUI graph ${file}${groups ? ` (${groups})` : ''}.`)
        .replace(/^从 ComfyUI 图工作流 (.+) 提取第 (\d+) 个分量（(\d+) 节点）(?:（(.*)）)?。$/, (_, file, index, size, groups) => `Extracted component ${index} (${size} nodes) from the ComfyUI graph ${file}${groups ? ` (${groups})` : ''}.`),
    }
  }
  return {
    name: name.replace(/ · Main flow$/, ' · 主流程')
      .replace(/ · Component (\d+)(?: \((.*)\))?$/, (_, index, groups) => ` · 分量${index}${groups ? `（${groups}）` : ''}`) + suffix,
    description: description
      .replace(/^Extracted (\d+) components from the ComfyUI graph (.+) into one runnable workflow\.$/, '从 ComfyUI 图工作流 $2 整体提取：$1 个分量合成一个运行工作流。')
      .replace(/^Extracted the main flow \((\d+) nodes\) from the ComfyUI graph (.+?)(?: \((.*)\))?\.$/, (_, size, file, groups) => `从 ComfyUI 图工作流 ${file} 提取主流程（${size} 节点）${groups ? `（${groups}）` : ''}。`)
      .replace(/^Extracted component (\d+) \((\d+) nodes\) from the ComfyUI graph (.+?)(?: \((.*)\))?\.$/, (_, index, size, file, groups) => `从 ComfyUI 图工作流 ${file} 提取第 ${index} 个分量（${size} 节点）${groups ? `（${groups}）` : ''}。`),
  }
}
