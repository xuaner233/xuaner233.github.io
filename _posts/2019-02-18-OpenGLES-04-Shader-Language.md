---
layout:      post
title:       "OpenGL ES 学习笔记 - Shader Language"
subtitle:    "着色器语言"
date:	       2019-02-18
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

着色器是图形API OpenGL ES 的一个核心概念，所有需要渲染的流程核心便是利用顶点和片段着色器渲染出期望的图片。那么这篇就来过一遍着色器语言的知识，确保我们对着色器有基本的概念。本篇将包含下列概念：

- 变量和变量类型
- 向量和矩阵：构造及选择
- 常量
- 结构和数组
- 运算符、控制流和函数
- 输入/输出变量、统一变量、统一变量块以及布局限定符
- 预处理器和指令
- 统一变量和差值器打包
- 精度限定符和不变性

## 1. 着色语言基础知识

- 类 `C` 语言语法
- 版本规范声明：第一行 （例：`#version 300 es`） 

## 2. 变量及变量类型

### 2.1 变量类型
向量和矩阵是着色器语言的核心数据类型，下表列了具体各变量类型：

| 变量分类 | 类型名 | 备注 |
| --- | --- | --- |
| 标量 | float, int, uint, bool | 标量数据类型 |
| 浮点向量 | float, vec2, vec3, vec4 | 1、2、3、4个分量的浮点向量 |
| 整数向量 | int, ivec2, ivec3, ivec4 | 1、2、3、4个分量的整型向量 |
| 无符号整数向量 | uint, uvec2, uvec3, uvec4 | 1、2、3、4个分量的无符号整型向量 |
| 布尔向量 | bool, bvec2, bvec3, bvec4 | 1、2、3、4个分量的布尔向量 |
| 矩阵 | mat2(=mat2x2), mat2x3, mat2x4, mat3x2, mat3(=mat3x3), mat3x4, mat4x2, mat4x3, mat4(=mat4x4) | axb 浮点矩阵 |

### 2.2 变量构造器

OpenGL ES着色器语言的变量在类型方面约束非常严格，变量的赋值和计算必须为相同类型变量，不允许隐式类型转换，这种设定是为了避免开发者遇到隐式转换带来的问题（通常是很难debug的）。在需要转换变量类型的case中，着色语言提供了一些可用的构造器来实现，使得用户可以通过构造器初始化变量或对变量做类型转换。贴个例子说明一下构造器的使用：

```c
float mFloat = 1.0;
float mFloat2 = 1;  /* ERROR: invalid type conversion */

bool mBool = true;

int mInt = 0;
int mInt2 = 0.0;   /* ERROR: invalid type conversion */

mFloat = float(mBool);    /* convert bool --> float */
mFloat = float(mInt);     /* convert int  --> float */
mBool = bool(mInt);       /* convert int  --> bool  */
```

向量的构造与转换：

- 向量构造器入参为标量，则该标量值为所设置向量的所有值
- 入参为多个标量或者向量，则从左向右使用入参值；如果是多个标量，标量数目须与所设置向量分量个数相同

继续贴例子：

```c
vec4 mVec4 = vec4(1.0);             /* { 1.0, 1.0, 1.0, 1.0 } */
vec3 mVec3 = vec3(1.0, 0.0, 0.5);   /* { 1.0, 0.0, 0.5 }      */
vec3 tmp   = vec3(mVec3);           /* { 1.0, 0.0, 0.5 }      */
vec2 mVec2 = vec2(mVec3);           /* { 1.0, 0.0 } */
```

矩阵的构造及转换：

- 构造器入参为标量，则标量值在对角线上，构成单位矩阵
- 矩阵可以由多个向量参数构造，mat2 可以由两个vec2 构造
- 矩阵可以由多个标量构造，从左到右使用
- 矩阵也可以用向量和标量的组合构造

注：OpenGL ES中的矩阵以**列**优先顺序存储。因此构造矩阵时，参数按列填充矩阵。下例：

```c
mat3 mMat3 = mat3(1.0, 0.0, 0.0,    /* 1st column */
                  0.0, 1.0, 0.0,    /* 2nd column */
                  0.0, 1.0, 1.0);   /* 3rd column */
```
 
## 3. 向量、矩阵及常量

### 3.1 向量和矩阵分量

向量访问有两种形式：1> 使用`.`运算符； 2> 通过数组下标。根据向量分量数量，每个分量可以使用 { x, y, z, w }、{ r, g, b, a }、{ s, t, p, q } 组合进行访问（分别为数学分量、颜色分量和纹理分量坐标系），三种命名方案均可使用。需要注意的是，同一访问只能使用一种命名方式，不能用`.xgr`这样的引用方式。继续放例子：

```c
vec3 mVec3 = vec3(0.0, 1.0, 2.0);
vec3 tmp;

tmp = mVec3.xyz;  /* { 0.0, 1.0, 2.0 } */
tmp = mVec3.zzz;  /* { 2.0, 2.0, 2.0 } */
tmp = mVec3.zyy;  /* { 2.0, 1.0, 1.0 } */
```

数组下标访问：元素[0]对应x，元素[1]对应y。矩阵为列优先矩阵，因此矩阵可以看做由列向量组成，即mat2看做两个vec2。因此，矩阵中单独的列可以通过数组下标运算符`[]`来选择，然后每个向量中可以通过`.`运算符访问内容。放例子：

```c
mat4 mMat4 = mat4(1.0);

vec4 mCol0 = mMat4[0];    /* column 0 of mat4    */
float m2_1 = mMat4[2][1];  /* 3rd column, 2nd row */
float m2_2 = mMat4[2].z;   /* 3rd column, 3rd row */
```

### 3.2 常量

限定符：`const`，与C/C++一致，常量值无法修改。

## 4. 结构体与数组

### 4.1 结构体
类C，直接上例子：

```c
struct fogStruct
{
	vec4 color;
	float start;
	float end;
} fogVar;  /* define a new struct forStruct and new var fogVar */

fogVar = fogStruct( vec4(1.0, 2.0, 3.0, 4.0), /* color */
                    0.5,                      /* start */
                    2.0);                     /* end */

vec4 color  = fogVar.color;
float start = fogVar.start;
float end   = fogVar.end;
```

### 4.2 数组

同样类C，继续放code：

```c
float fArray[4];
vec4  vArray[2];   /* 2-D array */

float a[4] = float[](1.0, 2.0, 3.0, 4.0);
float b[4] = float[4](1.0, 2.0, 3.0, 4.0);
vec2  c[2] = vec2[2](vec2(1.0), vec2(2.0));  /* { 1.0, 1.0, 2.0, 2.0 } */
```

## 5. 运算符

| 运算符 | 描述 |
| --- | --- |
| *, /, %, +, - | 乘、除、取模、加、减 |
| ++, -- | 递增、递减 |
| =, +=, -=, *=, /= | 赋值、算术赋值 |
| ==, !=, <, >, <=, >= | 比较运算符 |
| &&, \|\|, ^^ | 逻辑运算符 |
| <<, >> | 移位 |
| &, ^, \| | 位操作符 |
| ? : | 三元运算符 |
| , | 序列 |

注：

- 运算符只能用于相同基本类型的变量之间
- 二元运算符（+，-，*，/)变量的基本类型必须是浮点或者整数
- 除了 == 和 != 外，比较运算符只能用户标量值。向量比较可以用语言自带的内建函数实现。

## 6. 函数及内建函数

### GLSL 函数

GLSL 函数声明方法与C语言相同，不同之处在于 GLSL 需要提供函数传递参数的 `in/out` 声明，即需要给参数提供限定符。详见下表：

| 限定符 | 说明 |
| :---: | --- |
| in | （默认限定符） 指定参数按值传送，函数不能修改 |
| inout | 规定变量按照引用传入函数，可以修改，修改后在函数退出后变化 |
| out | 表示变量值不被传入函数，但是函数返回时将被修改 |

放个代码例子：

```c
vec4 mFunc(inout float mFloat,  /* inout param */
           out vec4 mVec4,      /* out param */
           mat3 mMat3)          /* in param (default) */
```

另外，比较重要的一点是：**GLSL函数不能递归！** 因为GPU没有堆栈...

### 內建函数

GLSL本身提供丰富的內建函数用来实现常用操作，用来处理各种常用的计算任务。放几个常用的內建函数感受一下：

| 函数大类 | 描述 |
| :---: | --- |
| 提供硬件功能 | 贴图相关等，如 texture2D() texture2DProj() textureCube() 等 |
| 常用繁琐操作 | 常用函数，如 abs/sign/floor/mod/min/max/clamp/mix/step 等 |
| 图形加速操作 | 三角函数(sin/cos)、指数函数(pow/exp/log)、几何函数(dot/cross/length)、矩阵及向量函数(matrixCompMult/equal/lessThan/any/all/not)等 |

### 控制语句

GLES 中 GLSL 支持 if-else 以及 while or do-while 控制语句，但在Open GLES中，循环语句需要注意GPU与CPU之间的差异性。GPU通常要求在一个批次的所有vertex或fragment中计算中所有分支。如果批次中的vetex或fragment执行不同路径，那么批次中的其他vertex或fragment也需要执行相应路径。因此在使用时需要考虑到GPU对批次的设计，使得同一批次中尽可能完成更多的job。

## 7. 统一变量（块）

> 在之前章节已经介绍过同一变量及同一变量块的概念，此处写一下shader里的内容

### 统一变量

统一变量是应用程序通过 OpenGL ES 转给shader的只读值（注意：只读），本质上，shader中的任何参数在所有vertex或者fragment中都应该以统一变量的形式传入。已知值的变量应该是常量，而不是统一变量，这样在编译时可以提高效率。

同一变量在全局作用域中声明，只需要统一限定符即可，放个例子：

```c
uniform mat4 viewMatrix;
uniform mat4 projMatrix;
uniform vec3 rotateAngle;
```

从GPU角度看，统一变量通常保存在硬件中（常量存储空间），是GPU为存储常量值而分配的特殊空间。因常量存储空间的大小一般是固定的，所以统一变量的数量也受到限制。我们可以通过內建变量 `gl_MaxVertexUniformVectors` 和 `gl_MaxFragmentUniformVectors` 的值来确定。也可通过 `glGetintegerv()` 查询 `GL_MAX_VERTEX_UNIFORM_VECTORS` 和 `GL_MAX_FRAGMENT_UNIFORM_VECTORS`。

### 统一变量块

统一变量块的优势在于：利用统一变量块，统一变量缓冲区数据可以在多个程序中共享，并且只需要设置一次即可。放个例子：

```c
uniform TransformBlock
{
	mat4 ViewProj;
	mat3 matNormal;
	mat3 matTexGen
};

layout(location = 0) in vec4 a_position;

void main()
{
	gl_Position = matView * a_position;
}
```

## 8. 着色器输入输出及限定符

### 顶点输入变量、属性变量

顶点输入变量用于指定vertex shader中的每个顶点的输入，用`in`关键词指定，通常存储位置、法线、纹理坐标以及颜色等数据。继续放例子：

```c
#version 300 es

uniform mat4 u_matViewProjection;

/* Vertex shader input */
layout[location = 0] in vec4 a_position;
layout[location = 1] in vec3 a_color;

/* Vertex shader output */
out vec3 v_color;

void main()
{
	gl_Position = u_matViewProjection * a_position;
	v_color = a_color;
}
```
上例中，有两个顶点输入变量 `a_position` 和 `a_color`，由应用程序加载。应用程序将为每个顶点创建一个顶点数组，该数组包含位置和颜色。

### 输出变量

同上部分例子代码，vertex shader的输出变量 `v_color` 由关键词 `out` 指定，vertex shader中的输出一般是作为fragment shader的输入变量，那么我们可以继续放相应的fragment shader的例子：

```c
#version 300 es
precision mediump float;

/* Input from vertex shader */
in vec3 v_color;

/* Output of fragment shader */
layout[location = 0] out vec4 o_fragColor;

void main()
{
	o_fragColor = vec4(v_color, 1.0);
}
```

### 精度限定符

精度限定符用以设定shader中变量的计算精度，可声明为低、中、高精度，便于用户在精度、速度以及功耗之间平衡。需要注意的是，精度下降后虽然可提升效率，但也会因为精度下降产生伪像。精度限定符可以用于指定任何基于浮点数或者整数的变量精度。放例子：

```c
highp vec4 pos;
varying lowp vec4 color;
mediump float specularExp;
```

另外，也可在 shader 的开头设置默认精度：

```c
precision highp float; /* float default is highp */
precision mediump int; /* int default is mediump */
```

vertex shader中没有指定默认精度，那么`int`和`float`的默认精度都为`highp`，即默认最高精度。而 fragment shader中，浮点值没有精度，因此shader必须声明默认精度或者每个float变量声明时指定精度。


### 插值限定符

上面的vertex shader 和 fragment shader中，各输入输出变量都没有使用限定符。在没有指定限定符时，默认插值限定符采用的是平滑着色，即来自 vertex shader 的输出变量在图元中线性插值，fragment shader 中接收线性插值后的数值作为输入。可用插值限定符如下：

- smooth： 平滑着色，线性插值
- smooth centroid：线性插值中，强制插值发生在被渲染图元内部，防止边缘伪像
- flat： 平面着色，以其中一个顶点为驱动顶点(Provoking vertex)，将该顶点值作用于图元中所有fragment

### 不变性限定符

`invariant` 关键字，在OpenGL ES中可用于任何可变的vertex shader的output，保证其不变性。原因在于：shader需要编译，而编译器可能进行优化从而导致指令重新排序(instruction reordering)，那么这种重排序可能引起相同的两个shader进行相同的计算时无法保证得到相同的结果。简言之，就是同一变量在不同shader中使用时，其值可能会不同而造成shader中的输出不同，因为不同的shader是单独编译的。

典型问题是在多遍shader特效时，相同的对象在Alpha混合绘制在自身上方，如果用于计算输出位置的数值精度不完全一样，精度差异会导致伪像。具体表现为”深度冲突“(Z fightling)，每个像素的Z精度差异导致不同次着色相互之间有微小的偏移。

通常情况下，不同shader之间的变量值差异是允许存在的，如果要避免这种差异，则可以用`invariant`限定符声明变量，可以单独指定某个变量或进行全局设置。

```c
/* set invariant at declration */
invariant varying mediump vec3 color;

/* set invariant after declration */
varying mediump vec3 color;
invariant color;

/* set all output variant with invariant */
#pragma STDGL invariant(all)
```

`invariant`会对编译器优化过程的灵活性产生影响，因此会牺牲整体性能，按需使用。


### 变量存储

底层硬件中可用于每个变量存储的资源是固定的。统一变量通常保存在所谓的“常量存储“中，这可以看做向量的物理数组。vertex shader 的输出/fragment shader的输入则一般保存在插值器中，通常也保存为一个向量数组。那么问题来了：变量是如何映射到硬件上的可用物理空间的呢？

在OpenGL ES 3.0，这个问题通过打包规则来处理，打包规则定义了插值器和统一变量映射到物理存储空间的方式。规则具体为：基于4x4网格概念，将其看做一个1行由4个列向量（每个列向量有4个存储位置）的网格，即其基本单位是1x4的列向量。打包规则只寻求打包变量，不进行重排序操作（这个需要编译器生成合并未打包数据的额外指令）。

还是上个例子理解一下：

```c
uniform mat3 mat;
uniform float f[6];
uniform vec3 vec;
```

如果不打包，那么`mat`占3行、`f`占6行、`v`占1行，共需要10行存储空间。如下表所示：

| 位置 | X | Y | Z | W |
| :---:| :---:| :---:| :---:| :---:|
|0|mat[0].x|mat[0].y|mat[0].z|-|
|1|mat[1].x|mat[1].y|mat[1].z|-|
|2|mat[2].x|mat[2].y|mat[2].z|-|
|3|f[0]|-|-|-|
|4|f[1]|-|-|-|
|5|f[2]|-|-|-|
|6|f[3]|-|-|-|
|7|f[4]|-|-|-|
|8|f[5]|-|-|-|
|9|v.x|v.y|v.z|-|

利用打包规则打包后，数据存储则为：

| 位置 | X | Y | Z | W |
| :---:| :---:| :---:| :---:| :---:|
|0|mat[0].x|mat[0].y|mat[0].z|f[0]|
|1|mat[1].x|mat[1].y|mat[1].z|f[1]|
|2|mat[2].x|mat[2].y|mat[2].z|f[2]|
|3|v.x|v.y|v.z|f[3]|
|4|-|-|-|f[4]|
|5|-|-|-|f[5]|

打包后只需要6行存储空间，即6个物理常量位置。关于`float f[6]`，书上写的是其元素跨越行的边界，没看懂，直接贴`OpenGLES 3`的Spec中关于浮点数打包规则：

> 1 component variables (e.g. floats and arrays of floats) have their own packing rule. They are packed in order of size, largest first. Each variable is placed in the column that leaves the least amount of space in the column and aligned to the lowest available rows within that column. During this phase of packing, space will be available in up to 4 columns. The space within each column is always contiguous in the case where no variables have explicit locations.

可以看出，浮点数阵列是按列存储的，因此打包的时候是从物理空间中找一块可以放下该浮点数阵列的长度的列，将该浮点数阵列放入。

总结一下就是，GPU硬件中存储空间有限，使用时应尽可能考虑到如何以更小的存储代价获得更好的渲染输出。



## 9. 预处理及存储空间优化

### 预处理器和指令

| 宏 | 描述 |
| :---: | --- |
| 定义 | #define #undef|
| 条件测试|#if #ifdef #ifndef #else #elif #endif|
| 错误 | #error |
| 编译器 | #pragma |
| 拓展| #extension，用于启用和设置拓展行为|


> Reference: 《OpenGL ES 3.0 编程指南》