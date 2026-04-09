# Authentic Prompt Benchmark (AP Bench)

Authentic Prompt Benchmark (AP Bench) is a real-world text-to-image prompt dataset and benchmark for studying **prompt informativeness**, **intent preservation**, and **generation stability** under realistic user prompting scenarios. It is built from authentic prompt–image pairs collected from public web repositories and is designed to better reflect the diversity, ambiguity, and uneven quality of practical user inputs than synthetic or manually constructed benchmarks.

The release contains a large full dataset for browsing and analysis, together with a curated benchmark subset for standardized evaluation. In the accompanying paper, AP Bench contains **17,580** authentic prompt–image pairs in total and a curated benchmark subset of **2,048** samples. The benchmark is organized around **1,000 intent categories**, and the released benchmark subset covers **742** labels. 

## Why AP Bench?

Existing text-to-image evaluations often emphasize prompt–image alignment, aesthetics, or compositional reasoning, but they do not directly focus on how well **authentic user prompts** convey underlying user intent. AP Bench is introduced to support research on this problem by benchmarking prompt optimization methods under realistic prompting conditions, including prompts written by both novice and expert users. 

The benchmark is motivated by three common sources of prompt-induced instability discussed in the paper:

- **Informational sparsity**: prompts are too short or underspecified.
- **Semantic imprecision and incompleteness**: prompts miss key constraints or intent details.
- **Lexical perturbation and noise sensitivity**: typos or noisy wording distort model understanding. 

## Dataset Construction

AP Bench is constructed from authentic prompts collected from real-world web platforms. Following the paper, prompts from **Lexica** are used as an initial source of **novice-style** prompts because they are typically shorter and less informative, while prompts from **Civitai** are used as an initial source of **expert-style** prompts because they more often contain richer semantic details and explicit attributes. These prompts are then manually annotated and re-verified. 

The annotation and verification process is designed to ensure that:

1. novice and expert prompts match their intended styles,
2. both **class-level intent** and **sentence-level intent** are available, and
3. the associated images are filtered for ethical compliance, safety, and the absence of sensitive content. 

Each intent category contains up to 10 instances, and each instance may include the user prompt, generated image URL, generation parameters, and auxiliary metadata. 

## Benchmark Difficulty Levels

The curated benchmark subset is stratified into three challenge levels based on intent clarity and category coverage: 

- **easy**: the user intent is explicit and the category belongs to the predefined category set.
- **medium**: the user intent remains explicit, but the category falls outside the predefined category set.
- **hard**: the category belongs to the predefined set, but the user intent is ambiguous. 


## Files

This release is organized as follows: 

- `full.jsonl`: full dataset for browsing, search, and large-scale analysis.
- `benchmark.jsonl`: curated benchmark subset for evaluation.
- `dataset_info.json`: dataset summary statistics and schema description.

## Dataset Summary

- **Full dataset rows**: 17,580
- **Full dataset labels**: 1,000
- **Benchmark rows**: 2,048
- **Benchmark labels**: 742 

## Schema

### Full Dataset Schema

Fields in `full.jsonl`: 

- `record_id`
- `sample_id`
- `source`: the original platform or collection source for each sample.
- `label`
- `index_in_label`
- `image_url`
- `prompt`
- `negative_prompt`
- `other_metadata`

### Benchmark Schema

Fields in `benchmark.jsonl`: 

- `record_id`
- `sample_id`
- `source`: the original platform or collection source for each sample.
- `user_type`: novice or expert user prompt style
- `label`: class-level intent category
- `image_url`
- `prompt`
- `negative_prompt`
- `other_metadata`
- `sentence_intent`: sentence-level intent description
- `challenge`

## Intended Use

AP Bench is intended for research on:

- prompt optimization for text-to-image generation,
- prompt informativeness and uncertainty analysis,
- intent preservation under authentic user prompting,
- robustness to ambiguous, underspecified, or noisy prompts, and
- benchmarking user-side prompt refinement methods.

The benchmark is especially suitable for evaluating methods that aim to improve generation stability from real user prompts rather than only improving aesthetics or superficial prompt–image alignment.

## Evaluation Perspective

According to the paper, AP Bench is designed around a multi-level evaluation view spanning prompt properties and end-to-end generation quality. The core metrics discussed in the paper include:

- **mutual information / alignment-oriented metrics** for end-to-end intent preservation,
- **prompt entropy** for prompt informativeness and uncertainty,
- **prompt energy** for model confidence with respect to the prompt, and
- **MLLM-based scoring / human evaluation** for fine-grained semantic and perceptual assessment. 
 

## Notes

- `source` records the original platform or collection source for each sample.
- `label` corresponds to the associated intent category.
- `sentence_intent` is only available in the benchmark subset and provides a finer-grained natural-language intent description for evaluation. This follows the paper’s design choice to include both class-level and sentence-level intent annotations.
- `other_metadata` can store auxiliary generation-related information.

<!-- ## Citation

If you use AP Bench in your research, please cite the accompanying paper.

```bibtex
@inproceedings{apbench2026,
  title={Prompt Stability Matters: A Benchmark for Quantifying Prompt Informativeness and Stability in Text-to-Image Models},
  author={Anonymous Author(s)},
  booktitle={Proceedings of ACM Multimedia},
  year={2026}
}
```

If you plan to make the repository public after review, replace the anonymous citation entry with the final camera-ready metadata. -->
