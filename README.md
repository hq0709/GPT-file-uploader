# GPT-File-Uploader
### By [Hanqi Jiang](https://hq0709.github.io/)

> 随便写着玩

# 1. 使用说明

## 后端

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## 前端

```bash
cd frontend
npm install
npm start
```

## Web端

```
1. 访问http://127.0.0.1:3000 （前端运行在3000端口，后端运行在5000端口）
2. 拖拽或点击上传文件，暂时支持txt/doc/docx/pdf
3. 点击submit提交文件
4. AI回复读取文件成功后，可针对文件内容进行提问
```

## 附加功能

```
如果担心上传的文件过多占用内存，可以选择上传文件五分钟后自动删除
```

## 常规报错

```
- sh : react-scripts: command not found
- 解决方案：删除npm依赖并重新npm install
```

# 2. 开发相关

## 关于 **llama_index**

> [llama-index · PyPI](https://pypi.org/project/llama-index/)
> 

> [Welcome to LlamaIndex 🦙 (GPT Index)! — LlamaIndex documentation (gpt-index.readthedocs.io)](https://gpt-index.readthedocs.io/en/latest/)
> 

`llama_index` 是一个GitHub项目，旨在提供一个简单的方法来利用OpenAI GPT系列模型（例如GPT-3）对一组文档进行索引和查询。该项目的核心思想是将文档编码为向量，然后在查询时与GPT模型的输出进行相似度比较。这个方法的目标是更高效地利用GPT模型的能力，减少API调用次数，从而降低成本。

`llama_index` 的主要组件包括：

1. `GPTSimpleVectorIndex` 类：这个类提供了一个简单的索引结构，用于存储文档向量及其对应的元数据。它包含用于向量化文档、计算文档间相似度、查询文档等的方法。
2. 数据加载器：用于从不同来源加载文档，如文件、URL或其他数据结构。在这个项目中，提供了一个名为 `SimpleDirectoryReader`的数据加载器，它可以从一个包含文本文件的目录中加载文档。

在这个项目中，选择使用LlamaIndex主要有以下几个原因：

1. 在使用openai基于GPT-3的模型（例如davinci）时，有最大token也就是输入和输出的限制，使用LlamaIndex可以解除这个限制。
2. LlamaIndex可以更好的衔接文件的上下文，并上传文件给GPT进行处理，具体方式是将上传的文件转换为json格式存储在本地（服务端），并提供给openai API进行解析。可以在[这里](https://gpt-index.readthedocs.io/en/latest/how_to/optimizers.html)找到是否使用LlamaIndex优化器的对比。（具体的原理我也没太明白，没有深究）

