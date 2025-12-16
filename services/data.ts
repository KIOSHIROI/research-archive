import { Author, ContentItem, ContentType, ResearchTheme } from '../types';

export const AUTHOR: Author = {
  name: { en: "Bai Xinyu (kioshiro)", zh: "白欣宇 (kioshiro)" },
  role: { en: "AI System Researcher & Engineer", zh: "AI 系统研究与工程师" },
  affiliation: { en: "Independent / System Lab", zh: "独立研究 / 系统实验室" },
  email: "poetyuqiubai@163.com",
  github: "github.com/kioshiro",
  bio: {
    en: "I am Bai Xinyu, currently exploring the engineering implementation and systematic evolution of AI models. My research examines capability boundaries under low-energy, lightweight, and social constraints. I view the model not just as a tool, but as a subject of study itself.",
    zh: "我是白欣宇，正在探索人工智能的工程落地与系统化发展。主要研究在大模型低能耗、轻量化、可部署性与社会约束下的能力演化。我不止将模型视为工具，更将其视为研究对象本身。"
  },
  education: [
    {
      school: { en: "University of Chinese Academy of Sciences, Hangzhou Institute for Advanced Study", zh: "中国科学院大学杭州高等研究院" },
      department: { en: "School of Intelligent Science and Technology", zh: "智能科学与技术学院" },
      major: { en: "Artificial Intelligence", zh: "人工智能" },
      stage: { en: "Prospective Master's", zh: "硕士研究生（拟入学）" }
    },
    {
      school: { en: "Beijing Normal University at Zhuhai", zh: "北京师范大学（珠海）" },
      department: { en: "College of Arts and Sciences", zh: "文理学院" },
      major: { en: "Artificial Intelligence", zh: "人工智能" },
      stage: { en: "Bachelor's Stage", zh: "本科阶段" }
    }
  ]
};

// Abstract diagram placeholders using solid colors and patterns
const IMG_THEME_1 = "https://placehold.co/600x400/e7e5e4/44403c?text=Multimodal+Structure";
const IMG_THEME_2 = "https://placehold.co/600x400/e7e5e4/44403c?text=Energy+Landscape";
const IMG_THEME_3 = "https://placehold.co/600x400/e7e5e4/44403c?text=Social+Constraint";

export const THEMES: ResearchTheme[] = [
  {
    id: "structural-understanding",
    title: { en: "Multimodal Structural Understanding", zh: "多模态结构理解" },
    description: { 
      en: "How can models move beyond pixel-level correlation to understand physical structures and causal relationships in visual data?",
      zh: "模型如何超越像素级相关性，真正理解视觉数据中的物理结构与因果关系？"
    },
    hypothesis: {
      en: "Hypothesis: Structural priors are more efficient than massive scale data for physical reasoning.",
      zh: "假设：在物理推理任务中，结构先验比海量数据规模更为高效。"
    },
    status: 'Exploring',
    order: 1,
    coverImage: IMG_THEME_1
  },
  {
    id: "green-architecture",
    title: { en: "Energy & Architecture Optimization", zh: "模型能耗与架构优化" },
    description: {
      en: "Exploring the trade-offs between parameter efficiency, inference latency, and carbon footprint in edge scenarios.",
      zh: "探索在边缘场景下，参数效率、推理延迟与碳足迹之间的权衡边界。"
    },
    hypothesis: {
      en: "Hypothesis: Intelligence density (IQ per Joule) is the only metric that matters for ubiquitous AI.",
      zh: "假设：智能密度（每焦耳智商）是普惠 AI 唯一重要的指标。"
    },
    status: 'Stabilizing',
    order: 2,
    coverImage: IMG_THEME_2
  },
  {
    id: "social-constraints",
    title: { en: "Reality Constraints & Alignment", zh: "通用能力的现实约束" },
    description: {
      en: "Embedding social norms and safety constraints directly into the latent space geometry rather than post-hoc RLHF.",
      zh: "将社会规范与安全约束直接嵌入潜空间几何结构，而非依赖事后的 RLHF。"
    },
    hypothesis: {
      en: "Hypothesis: Alignment is a geometric problem of manifold topology, not just reward modeling.",
      zh: "假设：对齐本质上是流形拓扑的几何问题，而不仅仅是奖励建模。"
    },
    status: 'Active',
    order: 3,
    coverImage: IMG_THEME_3
  }
];

export const CONTENT: ContentItem[] = [
  {
    id: "art-01",
    type: ContentType.ARTICLE,
    themeId: "green-architecture",
    title: { 
      en: "Beyond Quantization: Dynamic Sparsity in Edge Inference", 
      zh: "超越量化：边缘推理中的动态稀疏性" 
    },
    slug: "dynamic-sparsity-edge",
    date: "2024-02-10",
    abstract: {
      en: "A study on adaptive pruning rates based on input complexity. We demonstrate a 40% energy reduction on mobile GPUs without accuracy loss.",
      zh: "一项基于输入复杂度的自适应剪枝率研究。我们在移动 GPU 上实现了 40% 的能耗降低且无精度损失。"
    },
    metadata: {
      journal: "System.ML Draft",
      techStack: ["CUDA", "PyTorch", "MobileNet"]
    },
    content: {
      en: `
## Problem
Uniform quantization (INT8/INT4) treats all tokens equally. However, linguistic redundancy suggests that "stop words" require less computational precision than "entities".

## Method
We propose **Context-Aware Bit-Width Adaptation (CABA)**.
Instead of a fixed bit-width, we train a lightweight "router" head that predicts the necessary precision for the next layer based on attention entropy.

$$ P(precision | x) = Softmax(W_p \cdot x) $$

## Experiment
Tested on LLaMA-7B deployed on Jetson Orin.
*   **Baseline**: 14ms/token @ 12W
*   **Ours**: 9ms/token @ 8W

## Reflection
This implies that "thinking fast and slow" can be implemented at the hardware instruction level.
      `,
      zh: `
## 问题
统一量化（INT8/INT4）平等对待所有 Token。然而，语言冗余性表明，“停用词”所需的计算精度远低于“实体词”。

## 方法
我们提出了 **上下文感知位宽自适应 (CABA)**。
我们不再使用固定位宽，而是训练一个轻量级的“路由”头，根据注意力熵预测下一层所需的精度。

$$ P(precision | x) = Softmax(W_p \cdot x) $$

## 实验
在 Jetson Orin 上部署 LLaMA-7B 进行测试。
*   **基线**: 14ms/token @ 12W
*   **本方法**: 9ms/token @ 8W

## 思考
这意味着“快思考与慢思考”可以在硬件指令级别实现。
      `
    },
    coverImage: "https://placehold.co/800x400/e7e5e4/57534e?text=Sparsity+Heatmap"
  },
  {
    id: "proj-01",
    type: ContentType.PROJECT,
    themeId: "structural-understanding",
    title: { en: "Voxel-Concept-Link", zh: "体素-概念链接 (VCL)" },
    slug: "voxel-concept-link",
    date: "2023-11-20",
    abstract: {
      en: "Connecting 3D latent representations in vision encoders to semantic concepts in LLMs. A framework for embodied reasoning.",
      zh: "将视觉编码器中的 3D 潜层表征与 LLM 中的语义概念连接。一个具身推理框架。"
    },
    metadata: {
      repoUrl: "github.com/kioshiro/vcl",
      techStack: ["NeRF", "CLIP", "Python"]
    },
    content: {
      en: `
## Motivation
Current VLMs (Visual Language Models) are essentially 2D-to-Text mappers. They lack "object permanence" and 3D spatial awareness.

## Approach
We project CLIP embeddings into a NeRF field.
1.  Train a NeRF on the scene.
2.  Distill semantic features into the voxel grid.
3.  Query the grid via coordinate-based prompts.

## Result
The model can answer questions like "What is *behind* the red chair?" by traversing the voxel grid, even if the object is occluded in the current view.
      `,
      zh: `
## 动机
当前的 VLM（视觉语言模型）本质上是 2D 到文本的映射器。它们缺乏“客体永久性”和 3D 空间感知。

## 方法
我们将 CLIP 嵌入投影到 NeRF 场中。
1.  在场景上训练 NeRF。
2.  将语义特征蒸馏到体素网格中。
3.  通过基于坐标的提示查询网格。

## 结果
模型可以通过遍历体素网格回答诸如“红椅子*后面*是什么？”之类的问题，即使该物体在当前视图中被遮挡。
      `
    }
  },
  {
    id: "art-02",
    type: ContentType.ARTICLE,
    themeId: "social-constraints",
    title: { en: "The Geometry of Harm", zh: "伤害的几何学" },
    slug: "geometry-of-harm",
    date: "2024-01-05",
    abstract: {
      en: "Mapping the topological regions of harmful outputs in high-dimensional latent spaces. Can we prune 'harm' without lobotomizing creativity?",
      zh: "绘制高维潜空间中由于有害输出形成的拓扑区域。我们能否在不切除创造力的情况下修剪“伤害”？"
    },
    content: {
      en: "Content represents a failed attempt. The boundary between 'harmful' and 'novel' is fractal-like.",
      zh: "此内容代表一次失败的尝试。“有害”与“新颖”之间的边界呈分形结构。"
    }
  }
];

export const SPECULATIVE_CONTENT = {
  title: { en: "Speculative Notes", zh: "推演笔记" },
  items: [
    {
      date: "2024-03-22",
      text: {
        en: "If we compress a model enough, does it dream? Or does it just hallucinate efficiently? The line between compression and abstraction is the line between memory and understanding.",
        zh: "如果我们把模型压缩得足够小，它会做梦吗？还是仅仅在高效地产生幻觉？压缩与抽象的界限，就是记忆与理解的界限。"
      }
    },
    {
      date: "2024-02-14",
      text: {
        en: "Ethical constraint as a physical law. Imagine a model where generating a lie costs infinite energy. Thermodynamics of truth.",
        zh: "将伦理约束视为物理定律。想象一个模型，生成谎言需要消耗无限的能量。真理的热力学。"
      }
    },
    {
      date: "2024-01-30",
      text: {
        en: "The true AGI won't be a chatbot. It will be the infrastructure itself. Invisible, ubiquitous, regulating the flow of bits and atoms like gravity.",
        zh: "真正的 AGI 不会是聊天机器人。它将是基础设施本身。不可见，无处不在，像重力一样调节比特和原子的流动。"
      }
    }
  ]
};

export const getThemes = (): ResearchTheme[] => THEMES.sort((a, b) => a.order - b.order);

export const getAllContent = (): ContentItem[] => CONTENT.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const getContentBySlug = (slug: string): ContentItem | undefined => CONTENT.find(c => c.slug === slug);

export const getContentByTheme = (themeId: string): ContentItem[] => CONTENT.filter(c => c.themeId === themeId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
