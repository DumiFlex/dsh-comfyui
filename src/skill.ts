/**
 * Companion instructions registered with the host's model-facing skill service.
 */
export const COMFYUI_SKILL = {
  name: 'dsh-comfyui-workflows',
  source: 'runtime',
  description: 'Generate images, video, or audio with saved ComfyUI workflows. Covers graph extraction, parameter overrides, media inputs, and workflow skill packs.',
  whenToUse: 'Use for ComfyUI generation, running or managing saved ComfyUI graphs, finding local ComfyUI directories, or refreshing TTS-Audio-Suite voice options.',
  content: `# ComfyUI workflows

## Generate with a saved workflow

1. Call comfyui_workflow with action: list. Choose a workflow by its name, description, tags, and parameters. The list also includes server location, local install directories from settings, and files currently in the load area.
2. If the workflow has a skill pack, call action: skill with the workflow ID. Follow the workflow-specific instructions and read referenced files only as needed, using the returned base directory.
3. Call action: run with that ID and parameter overrides keyed by the exact listed names. Compose positive prompts from the user's request. Keep negative prompts at their defaults unless the request calls for a change. Unspecified inputs use saved defaults, except randomized seeds and applicable media defaults. Choose declared options exactly. Integers are rounded and floats retain decimals. Changing aspect_ratio can select the matching default size unless size is also supplied.
4. Use sync for quick image jobs and async for video, audio, or other long jobs. After launching an async run, tell the user it is in progress and end the turn. When the host notifies you, use job_output to retrieve the result. Avoid polling, sleeping or blocking on a background job.
5. Use the result's prompt and media references to describe what was generated in one sentence and paste the returned Markdown references verbatim. The result is final. This applies to direct calls and to the report returned inside run_code. Prefer direct calls when available.

Use action: get only to inspect or diagnose the API workflow. Use comfyui_object_info and comfyui_run only to build and test a workflow when a suitable saved workflow is unavailable. Look up the server's installed node types and allowed inputs before constructing API JSON. After testing, the user can save it through the panel's New workflow dialog.

## Graphs and runnable workflows

A saved ComfyUI UI graph is a canvas. The plugin extracts API-format workflows from it. If the list shows extracted: false, direct the user to Extract in the ComfyUI panel. For an extracted graph, choose the library ID from its derived entries. To import an API workflow directly, use New workflow and paste its JSON or select the file. Preset ZIP archives can move saved workflows and skill packs between installations. Imports create new library entries.

Analysis groups active linked nodes into connected components. Canvas groups are visual rectangles. Saved bypassed nodes (mode 4) and disconnected nodes are skipped. For a single runnable component, extract it directly. For multiple independent components, let the user choose all components together, one workflow per component, or just the largest component. The panel shows the analysis before extraction.

When diagnosing conversion:
- API links use string node IDs and numeric output slots. Read widget order from the saved node inputs, including linked widgets. Consume the control_after_generate widget slot for the corresponding INT input without writing it into API JSON.
- Read object-shaped widget values by input name and skip internal state. Keep dynamic combo child inputs flat under parent.child keys.
- Follow reroute and bypass nodes through their first connected input. Resolve KJNodes SetNode/GetNode by name and order. rgthree mute and bypass relay links carry state, not data.
- Unregistered Primitive nodes can supply inline values. Other connected UI-only nodes and subgraph instances can prevent extraction. Ask the user to expand subgraphs in ComfyUI. Links to missing output slots are disconnected with a warning. Required disconnected inputs prevent extraction unless declared lazy, templated, or auto-growing. Reconnect them in ComfyUI before retrying.

## Parameters and media

Auto-detection exposes prompts, resolution, sampling steps, seed, duration, aspect ratio, and compatible file loaders. Use Advanced parameters in the workflow editor to expose other inputs. A supported media list can expose individual reference slots. Pass a file name relative to its input subdirectory or an empty string to clear the reference. Use exact option values, including file names and paths.

The panel's load area lets users add slots, paste or upload files, or pick existing inputs and generated assets. Picking generated media copies it into the input directory. Use the list tool's loadArea before asking which files are loaded. Unspecified compatible loader inputs use occupied slots in order, matched by media type. When image dimensions are recorded, they can supply unspecified width and height. An uploaded file can also be referenced by its exact name, including any subfolder.

## TTS-Audio-Suite voices

Voice options in saved workflows are a snapshot. Before using a newly added voice, call comfyui_workflow action: refresh with the workflow ID, then action: list to inspect the new options. Refresh rescans the TTS voice library and updates parameter option and numeric metadata while retaining saved defaults and the parameter set. A ComfyUI-only refresh does not update saved snapshots.

On the configured ComfyUI server, use /api/tts-audio-suite/voice-library for voice keys, and /api/tts-audio-suite/voice-info?voice_name=<key> or /api/tts-audio-suite/voice-preview?voice_name=<key> for details or previews. Local voice files can live under models/voices, custom_nodes/tts_audio_suite/voices_examples, or locations configured in extra_model_paths.yaml. Use the server and local directories from action: list.

## Workflow skill packs

comfyui_workflow action: list shows a one-line summary for each attached pack. action: skill reads one workflow's SKILL.md. If a workflow requires its pack, action: run is gated until the current conversation reads that workflow's SKILL.md via action: skill or comfyui_skill action: read. The pack's workflow-specific instructions take precedence.

Use comfyui_skill with workflow_id to work inside a single pack. Use enable to create a pack and require to toggle required reading. Use list to inspect its file structure, and read for one file. Use write for new files or intentional full replacements, append for additions, and mkdir for a single-level folder. Use rename or delete for individual resources. Keep SKILL.md concise and include a summary when writing it. Link longer references or assets from SKILL.md. Record verified behavior and preserve user-authored material.
`,
}
