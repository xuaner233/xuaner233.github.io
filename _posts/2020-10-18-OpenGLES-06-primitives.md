---
layout:      post
title:       "OpenGL ES 学习笔记 - Primitive"
subtitle:    "图元装配和光栅化"
date:	       2020-10-18
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

图元是 `OpenGL ES` 中图形绘制的基本单位，由一组表示顶点位置的数据来描述，是 `glDrawArray`、`glDrawElements`、`glDrawRangeElements`、`glDrawArrayInstanced`和`glDrawElementsInstanced`命令绘制的几何形状对象。OpenGL ES可以绘制的图元有：

- 三角形
- 直线
- 点

## 1. 图元

### 三角形

三角形是3D渲染最常用的基本图元，万物皆可“三角形”。OpenGL ES中支持的三角形图元有：`GL_TRIANGLES`、`GL_TRIANGLE_STRIP`和`GL_TRIANGLE_FAN`。三种图元分别代表了三种不同的位置索引方式，用来指导Shader索引三角形的位置。

三种类型对应了不同的顶点索引方式

#### GL_TRIANGLES

```
Indices:    0 1 2 3 4 5 ...
Triangles: {0 1 2}
                 {3 4 5}
```

共绘制 `N/3` 个三角形．

#### GL_TRIANGLES_STRIP

```
Indices:    0 1 2 3 4 5 ...
Triangles: {0 1 2}
             {1 2 3} //drawing order is {2 1 3} to maintain proper winding
               {3 4 5}
                  {4 5 6} // drawing order is {5 4 6}
```

共绘制 `N-2` 个三角形

快速判断Index起点：上个triangle的终点即为下个triangle的起点

#### GL_TRIANGLE_FAN

```
Indices:    0 1 2 3 4 5 ...
Triangles: {0 1 2}
           {0   2 3}
           {0     3 4}
           {0       4 5}
```

共绘制 `N-2` 个三角形

### 直线

跟三角形类似，直线类型有 `GL_LINES`, `GL_LINE_STRIP` 和 `GL_LINE_LOOP`。

```
Indices:    0 1 2 3 4 5 ...
GL_LINES:  {0 1} {2 3} {4 5} ... //若Indices为奇数，最后一个点忽略，不画线
GL_LINE_STRIP: {0 1} {1 2} {2 3} ... // 一连串连接的线
GL_LINE_LOOP:  {0 1} {1 2} {2 3} ... {N 0} //闭环的线，最后一个点连接到第一个点
```

线宽默认值是1.0, 但可以通过 `glLineWidth` 指定线宽，单位是`像素`。注意：线宽指定后，全部更新为指定线宽，直至用户更新线宽。

查询线宽：

```
GLfloat lineWidthRange[2];
glGetFloatv(GL_ALIASED_LINE_WIDTH_RANGE, lineWidthRange);
```

### 点（精灵）

中文为了明确`GL_POINT`,故而翻译成点精灵，在此我们就一直用`GL_POINT`来表示吧。

`GL_POINT`是指定位置和半径的屏幕对齐的正方形。注意，是正方形！位置描述的是正方形的中心，半径用于计算正方形的4个点坐标。注意+1：如果半径未设置，则可能造成绘图错误，因为是undefined。

设置半径： `shader` 中指定 `gl_PointSize`

查询支持的size：

```
GLfloat pointSizeRange[2];
glGetFloatv(GL_ALIASED_POINT_SIZE_RANGE, pointSizeRange);
```

#### gl_PointCoord

`gl_PointCoord` 是 `fragment shader` 中关于`GL_POINT`的内建变量，范围 [0, 1]。需要注意的是：GLES的窗口原点（0, 0）在左下角， 而 `GL_POINT`的坐标原点在左上角。

## 2. 绘制图元




### 小结

其实对于顶点属性，了解并搞清楚概念是关键，其余的（顶点数组/缓冲区对象/数组对象等）都是为了更好的使用顶点属性而服务。所以，理解顶点属性便理解了上面的所有源头。


> Reference: 《OpenGL ES 3.0 编程指南》