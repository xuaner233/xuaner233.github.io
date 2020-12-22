---
layout:      post
title:       "OpenGL ES 学习笔记 - Vertex Attribute"
subtitle:    "顶点属性、数组和缓冲区对象"
date:	       2019-07-18
author:      "Xiaoxuan Liu"
header-img:  "imgs/OpenGL-ES3/logo.png"
header-mask: 0.3
catalog:     true
categories:
    - Graphic
tags:
    - OpenGL ES
---

> OpenGL ES 官方文档，请参考：
> https://www.khronos.org/registry/OpenGL-Refpages/

> 以及 ES3.0 请参考：
> https://www.khronos.org/registry/OpenGL-Refpages/es3.0/


## OverView

顶点数据也称顶点属性(Vertex Attribute)，指定每个顶点的数据。顶点数据可以指定单个顶点，也可以作为指定所有顶点的常量。例如，我们想要绘制纯黑色三角形，可以指定一个常量值来作用于三角形的3个顶点。但是，由于组成三角形的三个顶点位置不同，因此必须指定一个顶点数组来存储3个位置值。

## 1. 顶点属性（数据）

### 指定顶点属性数据

顶点属性数据可以用一个顶点数组指定每个顶点数据，也可以用一个常量值应用于所有顶点。可以用下面API来查询OpenGLES 3.0支持的顶点属性数量：

```c
GLint maxVertexAttribs; /* n >= 16 */
glGetIntegerv(GL_MAX_VERTEX_ATTRIBS, &maxVertexAttribs);
```

常量顶点属性对于一个图元的所有顶点都适用，因此是一个值指定图元所有顶点，API为：

```c
void glVertexAttrib1f(GLuint index, GLfloat x);
void glVertexAttrib2f(GLuint index, GLfloat x, GLfloat y);
void glVertexAttrib3f(GLuint index, GLfloat x, GLfloat y, GLfloat z);
void glVertexAttrib4f(GLuint index, GLfloat x, GLfloat y, GLfloat z, GLfloat w);

void glVertexAttrib1fv(GLuint index, const GLfloat *values);
void glVertexAttrib2fv(GLuint index, const GLfloat *values);
void glVertexAttrib3fv(GLuint index, const GLfloat *values);
void glVertexAttrib4fv(GLuint index, const GLfloat *values);

```

其中各函数加载内容为：

| 函数 | 加载数据 |
| :---: | :---: |
|glVertexAttrib1f<br>glVertexAttrib1fv|(x, 0.0, 0.0, 1.0)|
|glVertexAttrib2f<br>glVertexAttrib2fv|(x, y, 0.0, 1.0)|
|glVertexAttrib3f<br>glVertexAttrib3fv|(x, y, z, 1.0)|
|glVertexAttrib4f<br>glVertexAttrib4fv|(x, y, z, w)|

### 顶点数组

单个指定顶点毕竟效率低，那么顶点数组就来了。顶点数组用于指定每个顶点的属性，保存在应用程序地址空间的缓冲区。作为顶点缓冲对象的基础，顶点数组提供了一种灵活、高效的方式指定顶点属性。

```
void glVertexAttribPointer(GLint index, GLint size,
                           GLenum type,
                           GLBoolean normalized,
                           GLsizei stride,
                           const void *ptr)
void glVertexAttribIPointer(GLint index, GLint size,
                           GLenum type,
                           GLBoolean normalized,
                           GLsizei stride,
                           const void *ptr)
```

函数具体参数用法，请参照Spec，这里不作展开。分配和储存顶点数据通常有两种方法：

- 在缓冲区存储顶点属性数据 -- 这种方法被称为结构数组。结构表示所有顶点的属性，每个顶点有一个属性的数组
- 在单独的缓冲区表示每个顶点属性 -- 这种方法被称为数组结构。

详细聊聊：假定每个顶点有4个属性：位置、法线和两个纹理坐标。这些属性一起保存在为所有顶点分配的一个缓冲区中。其中顶点位置由一个3个浮点数的向量构成 `(x,y,z)`，顶点法线同样3浮点向量 `(x,y,z)`，纹理坐标有2浮点向量构成`(s,t)`。那么在缓冲区中，内存布局如下：

```
/* Total size = n * 10 * 4 Byte */
x,y,z,x,y,z,s,t,s,t   /* 一个顶点属性数据 */ /* 内存起始点 */
......                                    /* n-2 个顶点数据 */
x,y,z,x,y,z,s,t,s,t   /*  10*4 Byte    */ /* 内存结束点 */

```

放个例子演示一下如何使用顶点数组，分别以结构数组和数组结构的方式。需要注意的是：OpenGL ES 3.0 支持顶点数组只是为了与GLES 2.0 兼容，新的Spec推荐使用顶点缓冲区对象。

#### 结构数组

```
#define VERTEX_POS_SIZE       3   /* x, y, z */
#define VERTEX_NORMAL_SIZE    3   /* x, y, z */
#define VERTEX_TEXCOORD0_SIZE 2   /* s, t */
#define VERTEX_TEXCOORD1_SIZE 2   /* s, t */

#define VERTEX_POS_IDX        0
#define VERTEX_NORMAL_IDX     1
#define VERTEX_TEXCOORD0_IDX  2
#define VERTEX_TEXCOORD1_IDX  3

/* Offset for vertex data stored as array of structure */
#define VERTEX_POS_OFFSET        0
#define VERTEX_NORMAL_OFFSET     3
#define VERTEX_TEXCOORD0_OFFSET  6
#define VERTEX_TEXCOORD1_OFFSET  8

#define VERTEX_ATTRIB_SIZE (VERTEX_POS_SIZE + \
                            VERTEX_NORMAL_SIZE + \
                            VERTEX_TEXCOORD0_SIZE + \
                            VERTEX_TEXCOORD1_SIZE)

/* alloc mem for vertices data */
float *p = (float *)malloc(numVertices * VERTEX_ATTRIB_SIZE * sizeof(float));

/* position is vertex attribute 0 */
glVertexAttribPointer(VERTEX_POS_IDX, VERTEX_POS_SIZE,
                      GL_FLOAT, GL_FALSE,
                      VERTEX_ATTRIB_SIZE * sizeof(float),
                      p);

/* normal is vertex attribute 1 */
glVertexAttribPointer(VERTEX_NORMAL_IDX, VERTEX_NORMAL_SIZE,
                      GL_FLOAT, GL_FALSE,
                      VERTEX_ATTRIB_SIZE * sizeof(float),
                      (p + VERTEX_NORMAL_OFFSET));

/* texture coordnate 0 is vertex attribute 2 */
glVertexAttribPointer(VERTEX_TEXCOORD0_IDX, VERTEX_TEXCOORD0_SIZE,
                      GL_FLOAT, GL_FALSE,
                      VERTEX_ATTRIB_SIZE * sizeof(float),
                      (p + VERTEX_TEXCOORD0_OFFSET));

/* texture coordnate 1 is vertex attribute 3 */
glVertexAttribPointer(VERTEX_TEXCOORD1_IDX, VERTEX_TEXCOORD1_SIZE,
                      GL_FLOAT, GL_FALSE,
                      VERTEX_ATTRIB_SIZE * sizeof(float),
                      (p + VERTEX_TEXCOORD1_OFFSET));
```

#### 数组结构

数组结构情况下，每种数组属性数据（位置、法线、纹理坐标）都保存在单独的缓冲区中。

```
/* Macro define refer to code above */

/ alloc mem for attribute data */
float *pos = (float *)malloc(numVertices * VERTEX_POS_SIZE * sizeof(float));

float *normal = (float *)malloc(numVertices * VERTEX_NORMAL_SIZE * sizeof(float));

float *texcoord0 = (float *)malloc(numVertices * VERTEX_TEXCOORD0_SIZE * sizeof(float));

float *texcoord1 = (float *)malloc(numVertices * VERTEX_TEXCOORD1_SIZE * sizeof(float));

/* position is vertex attribute 0 */
glVertexAttribPointer(VERTEX_POS_IDX, VERTEX_POS_SIZE,
                      GL_FLOAT, GL_FALSE,
                      VERTEX_POS_SIZE * sizeof(float),    /* stride is postion stide */
                      pos);

/* normal is vertex attribute 1 */
glVertexAttribPointer(VERTEX_NORMAL_IDX, VERTEX_NORMAL_SIZE,
                      GL_FLOAT, GL_FALSE,
                      VERTEX_NORMAL_SIZE * sizeof(float),
                      normal);

/* texture coordnate 0 is vertex attribute 2 */
glVertexAttribPointer(VERTEX_TEXCOORD0_IDX, VERTEX_TEXCOORD0_SIZE,
                      GL_FLOAT, GL_FALSE,
                      VERTEX_TEXCOORD0_SIZE * sizeof(float),
                      texcoord0);

/* texture coordnate 1 is vertex attribute 3 */
glVertexAttribPointer(VERTEX_TEXCOORD1_IDX, VERTEX_TEXCOORD1_SIZE,
                      GL_FLOAT, GL_FALSE,
                      VERTEX_TEXCOORD1_SIZE * sizeof(float),
                      texcoord1);
```

#### 性能讨论

对于GLES 3.0 硬件实现来说，结构数组和数组结构，哪种更高效呢？大部分情况下，是结构数组。这是因为每个顶点属性数据可以顺序存取，因此对内存来说更高效。但其缺点在于，需要修改特定属性时（例如纹理坐标），则需要跨距更新。当顶点缓冲区以缓冲区对象形式提供时，需要重新加载**整个**顶点属性缓冲区。当然，也可以通过将动态的顶点属性保存在单独的缓冲区来避免这种效率低下的情况。

#### 顶点属性数据格式讨论(type)

`type`指定数据类型，同样也会影响数据存储空间大小，进而影响整体性能。这个会影响渲染帧所需内存带宽，数据越少，所需带宽越小，性能越好。`GLES 3.0` 支持 `GL_HALF_FLOAT` 数据格式，因此在不影响精度的情况下，建议尽量使用 `GL_HALF_FLOAT` 来减小带宽（纹理坐标、法线、副法线、切向量等）。颜色可以存储为`GL_UNSIGNED_BYTE`，

## 2. 顶点属性变量使用：声明

### layout 限定符

```
layout (location = N)
// Example:
layout (location = 0) in vec4 a_position;
```

### Attrib 相关 API

```
void glGetActiveAttrib(GLuint program, GLuint index, GLsizei bufsize, GLsizei *length, GLenum *type, GLint *size, GLchar *name)
void glBindAttribLocation(GLuint program, GLuint index, const GLchar *name)
GLint glGetAttribLocation(GLuint program, const GLchar *name)
```

## 3. 顶点缓冲区对象

### 优劣分析

顶点数据是保存在用户内存中的，在用 `glDrawArrays` 或者 `glDrawElements` 进行绘制时，需要从用户内存中复制顶点数据到图形内存（GPU Mem）。但是，并不是所有的drawcall都需要即时更新顶点数据，因此将顶点数据缓存是一个不错的选择，这就是顶点缓冲区对象的由来。好处：

- 显著改进渲染功能
- 降低内存带宽
- 降低功耗（低带宽）

OpenGL ES 3.0支持两类缓冲区对象：数组缓冲区对象和元素数组缓冲区对象，分别用于指定顶点和图元数据。

- GL\_ARRAY_BUFFER: 指定的数组缓冲区对象用户创建保存顶点数据的缓冲区对象
- GL\_ELEMENT\_ARRAY_BUFFER：指定的元素数组缓冲区对象用于创建保存图元索引的缓冲区对象

### 缓冲区对象相关 API

```
void glGenBuffers(GLsizei n, GLuint *buffers)
void glBindBuffer(GLenum target, GLuint buffer)
void glBufferData(GLenum target, GLsizeiptr size, const void *data, GLenum usage)
void glBufferSubData(GLenum target, GLintptr offset, GLsizeiptr size, const void *data)
void glDeleteBuffers(GLsizei n, const GLuint *buffers)
```

### 映射缓冲区对象

有时候，我们需要将缓冲区对象数据Map出来，考虑如下情况（好处）：

- 减少App的内存占用，如果映射出来，则只需要存储一个数据副本即可
- 在共享内存架构中，映射缓冲区可返回GPU缓冲区中地址空间的直接指针

总之，就是可以直接从GPU拿到数据使用。但是请注意：Map之后，操作的是GPU缓冲区，需慎重！

列一下相关API：

```
void *glMapBufferRange(GLenum target, GLintptr offset, GLsizeiptr length, GLbitfield access)
GLboolean glUnmapBuffer(GLenum target)
void *glFlushMappedBufferRange(GLenum target, GLintptr offset, GLsizeptr length)
```　

### 复制缓冲区对象

```
void glCopyBuffersSubData(GLenum readtarget, GLenum writetarget)
```

## 4. 顶点数组对象

加载顶点属性的两种方式：顶点数组和顶点缓冲区对象，都会在过程中（可能多次）调用 `glBindBuffer`、`glVertexAttribPointer` 和 `glEnableVertexAttribArray`。那么，为了更快/更方便的在顶点数组配置之间切换，OpenGL ES 3.0中引入了“顶点数组对象(VAO)”的概念，提供包含在顶点数组/缓冲区对象配置之间切换所需要的所有状态的单一对象。

Spec中，当前总有一个Active的顶点数组对象，即默认VAO（ID为0）。概念清楚后，直接列相关API：

```
void glGenVertexArrays(GLsizei n, GLuint *arrays)
void glBindVertexArray(GLuint array)
void glDeleteVertexArrays(GLsizei n, GLuint *arrays)
```

### 小结

其实对于顶点属性，了解并搞清楚概念是关键，其余的（顶点数组/缓冲区对象/数组对象等）都是为了更好的使用顶点属性而服务。所以，理解顶点属性便理解了上面的所有源头。


> Reference: 《OpenGL ES 3.0 编程指南》