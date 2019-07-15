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

```
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

```
mat3 mMat3 = mat3(1.0, 0.0, 0.0,    /* 1st column */
                  0.0, 1.0, 0.0,    /* 2nd column */
                  0.0, 1.0, 1.0);   /* 3rd column */
```
 
## 3. 向量、矩阵及常量

### 3.1 向量和矩阵分量

向量访问有两种形式：1> 使用`.`运算符； 2> 通过数组下标。根据向量分量数量，每个分量可以使用 { x, y, z, w }、{ r, g, b, a }、{ s, t, p, q } 组合进行访问（分别为数学分量、颜色分量和纹理分量坐标系），三种命名方案均可使用。需要注意的是，同一访问只能使用一种命名方式，不能用`.xgr`这样的引用方式。继续放例子：

```
vec3 mVec3 = vec3(0.0, 1.0, 2.0);
vec3 tmp;

tmp = mVec3.xyz;  /* { 0.0, 1.0, 2.0 } */
tmp = mVec3.zzz;  /* { 2.0, 2.0, 2.0 } */
tmp = mVec3.zyy;  /* { 2.0, 1.0, 1.0 } */
```

数组下标访问：元素[0]对应x，元素[1]对应y。矩阵为列优先矩阵，因此矩阵可以看做由列向量组成，即mat2看做两个vec2。因此，矩阵中单独的列可以通过数组下标运算符`[]`来选择，然后每个向量中可以通过`.`运算符访问内容。放例子：

```
mat4 mMat4 = mat4(1.0);

vec4 mCol0 = mMat4[0];    /* column 0 of mat4    */
float m2_1 = mMat4[2][1]  /* 3rd column, 2nd row */
float m2_2 = mMat4[2].z   /* 3rd column, 3rd row */
```

### 3.2 常量

限定符：`const`，与C/C++一致，常量值无法修改。

## 4. 结构体与数组

### 4.1 结构体
类C，直接上例子：

```
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

```
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


