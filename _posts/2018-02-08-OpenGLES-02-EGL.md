---
layout:      post
title:       "OpenGL ES 学习笔记 - EGL"
subtitle:    "绘图表面管理"
date:	       2018-02-08
author:      "Xiaoxuan Liu"
header-img:  "imgs/OpenGL-ES3/logo.png"
header-mask: 0.3
catalog:     true
categories:
    - Graphic
tags:
    - OpenGL ES
---

> EGL 官方指南：[EGL Reference Pages](https://www.khronos.org/registry/EGL/sdk/docs/man/)

## EGL 简介

作为 Khronos 组织开发 API 家族的一员，EGL 大部分 API 与平台无关，可用于管理绘图表面。在使用中，EGL 提供以下机制：

- 与设备的原生窗口系统通信
- 查询绘图表面的可用类型和配置
- 创建绘图表面
- 在 OpenGL ES 3.0 和其他图形渲染 API （如 OpenGL 和 OpenVG，或者窗口系统的原生绘图命令）之间同步渲染
- 管理纹理贴图等渲染资源


## 1. 与窗口系统通信

因为每个窗口系统都有不同的语义，所以 EGL 提供基本的不透明类型（void*） `EGLDisplay`，该类型封装了所有系统相关特性，用于和原生系统窗口接口。使用 EGL 的程序，第一步必须是先创建并初始化与本地 EGL 显示的连接。

代码示例如下：

```c
EGLint majorVersion;
EGLint minorVersion;

EGLDisplay display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
if (display == EGL_NO_DISPLAY)
{
	/* Unable to open connection to local window system */
}

if (!eglInitialize(display, &majorVersion, &minorVersion))
{
	/* Unable to init EGL */
}

```

#### 打开显示连接

> EGLDisplay eglGetDisplay(EGLNativeDisplayType displayId)

displayId: 指定显示连接，默认为 EGL_DEFAULT_DISPLAY

这里需注意：`EGLNativeDisplayType` 类型是为了匹配原生窗口系统的显示类型，根据平台 EGLNativeDisplayType 可被定义为系统所用显示类型。

#### 初始化 EGL 显示

> EGLBoolean eglInitialize(EGLDisplay display, EGLint *majorVersion, EGLint *minorVersion)

- display: 指定显示连接
- majorVersion: EGL 主版本号，可为 NULL
- minorVersion: EGL 次版本号，可为 NULL

若初始化失败，则返回 EGL_FALSE，并将 EGL 错误代码设置为： EGL_BAD_DISPLAY 或 EGL_NOT_INITIALIZED。


## 2. 确定可用表面配置

初始化 EGL 之后，下一步就是要确认可用于渲染表面的类型和配置。

#### 查询可用配置
EGL 提供 `eglGetConfigs` 函数用以匹配最佳配置。

> EGLBoolean eglGetConfigs(EGLDisplay display, EGLConfig *configs, EGLint maxReturnConfigs, EGLint *numConfigs)

- display: 指定显示连接
- configs: 指定返回的configs列表
- maxReturnConfigs： 指定configs的大小
- numConfigs： 指定返回configs的大小

注：如果指定`configs` 入参为 NULL，eglGetConfigs 将返回 EGL_TRUE，并将 numConfigs 设置为系统可用EGLConfigs的数量，但没有任何其他附加信息返回，仅用于查询系统可用配置数量！

#### 查询属性

> EGLBoolean eglGetConfigAttrib(EGLDisplay display, EGLConfig config, EGLint attribute, EGLint *value)

该函数返回相关 EGLConfig 的指定属性值，可查询属性值可参见 [eglGetConfigAttrib](https://www.khronos.org/registry/EGL/sdk/docs/man/html/eglGetConfigAttrib.xhtml)

#### 选择配置

> EGLBoolean eglChooseConfig(EGLDisplay display, const EGLint *attribList, EGLConfig *configs, EGLint maxReturnConfigs, EGLint *numConfigs)

该函数根据提供的 attribList 选择匹配的 EGLConfig， 对于 attribList 中未明确的属性值，将采用默认值。当有多个匹配时，将按照以下顺序排列配置：

1. 检测 EGL_CONFIG_CAVEAT 配置，优先级顺序为：EGL_NONE > EGL_SLOW_CONFIG > EGL_NON_CONFORMANT_CONFIG.
2. 根据 EGL_COLOR_BUFFER_TYPE 指定的缓冲区类型
3. 按颜色缓冲区位数降序排列。
- 缓冲区类型为RGB时，位数 = EGL_RED_SIZE + EGL_GREEN_SIZE + EGL_BLUE_SIZE
- 缓冲区类型为YUV时，位数 = EGL_LUMINANCE_SIZE + EGL_ALPHA_SIZE
4. 按 EGL_BUFFER_SIZE 的值升序排列。
5. 按 EGL_SAMPLE_BUFFERS 值升序排列。
6. 按 EGL_SAMPLES 数量升序排列。
7. 按 EGL_DEPTH_SIZE 值升序排列。
8. 按 EGL_STENCIL_SIZE 值升序排列。
9. 按 EGL_ALPHA_MASK_SIZE 值升序排列。
10. 按 EGL_NATIVE_VISUAL_TYPE 中具体实现方式排序。
11. 按 EGL_CONFIG_ID 升序排列。


## 3. EGL 渲染区域

得到符合渲染要求的 EGLConfig，下一步就可以创建渲染窗口了。

#### 窗口渲染区

> EGLSurface eglCreateWindowSurface(EGLDisplay display, EGLConfig config, EGLNativeWindowType window, const EGLint *attribList)

该函数以 EGLDisplay 和 EGLConfig 为参数，根据指定的窗口属性列表创建渲染窗口，示例代码如下：

```c
EGLint attribList[] =
{
	EGL_RENDER_BUFFER, EGL_BACK_BUFFER,
	EGL_NONE
};

EGLSurface window = eglCreateWindowSurface(display, config, nativeWindow, attribList);

/* check if window create success */
if (window == EGL_NO_SURFACE)
{
	switch (eglGetError())
	{
		case EGL_BAD_MATCH:
			/* check window and EGLConfig attributes */
			break;
		case EGL_BAD_CONFIG:
			/* verify if EGLConfig valid */
			break;
		case EGL_BAD_NATIVE_WINDOW:
			/* verify if EGLNativeWindow valid */
			break;
		case EGL_BAD_ALLOC:
			/* resources shortage */
			break;
	}
}

```

#### 屏幕外渲染区：EGL Pbuffer

除窗口渲染区外，OpenGL ES 还可以渲染 `pbuffer` （pixel buffer）的不可见屏幕表面。Pbuffer 最常用于生成纹理贴图。不过，若要渲染到纹理，建议使用bramebuffer 替代 pixel buffer，因为帧缓冲区更高效。

Pbuffer 的创建和窗口创建类似，不过在EGLConfig 中需要增加 EGL_SURFACE_TYPE 的属性值，使其包含 EGL_PBUFFER_BIT。

Pbuffer 与窗口一样，支持所有的 OpenGL ES 3.0 渲染机制，不同在于 Pbuffer 不在屏幕显示。完成渲染后，通常将 Pbuffer 复制到应用程序，或者将其绑定更改为纹理。


## 4. 创建渲染上下文

#### 创建上下文

上下文（Context）的概念，在 OpenGL ES 中是一个内部的数据结构，这里面包含了操作所需要的所有的状态信息。在 OpenGL ES 中，必须有一个可用的上下文才能进行进一步的绘图。关于 Context 所包含的信息，举个例子：顶点信息、片段着色器以及顶点数据数组的引用等都可通过上下文来获得。

> EGLContext eglCreateContext(EGLDisplay display, EGLConfig config, EGLContext shareContext, const EGLint *attribList)

`shareContext`: 允许多个 EGL 上下文共享特定类型的数据，如着色器程序和纹理贴图； EGL_NO_CONTEXT 表示不共享。

#### 指定当前上下文

应用程序可能创建多个 EGLContext 用于不同用途，因此使用过程中需要关联特定上下文和渲染表面，即“指定当前上下文”

> EGLBoolean eglMakeCurrent(EGLDisplay display, EGLSurface draw, EGLSurface read, EGLContext context)

## 5. 同步渲染

有时，应用程序有协调多个图形 API 在单个窗口中渲染的情况，EGL 对于这种情况提供了同步渲染的 API。

- 若 APP 只使用 OpenGL ES 进行渲染，则可调用 `glFinish` 保证所有渲染已经开始
- 若 APP 使用不止一种 Khronos API（OpenGL ES, OpenGL, OpenVG） 渲染，在切换窗口系统原生渲染 API 之前可能无法得知使用的是哪个 API， 则可调用 `eglWaitClient`，延迟客户端的执行，直至通过某个 Khronos API 的所有渲染完成。 该函数与 glFinish 类似，但不管当前进行操作的是哪个 Khronos API 都有效。
- 如果需要保证原生窗口系统的渲染完成，则可调用函数 `eglWaitNative`。

***

## 示例：创建 EGL 窗口

注：`nativeWindow` 变量为原生系统所创建原生窗口，生成方式由所在系统(X11, fbdev, drm, wayland, android等)决定，不在本次例程内。请参考原生窗口系统文档，以确定具体创建方式。

```c
EGLBoolean initializeWindow(EGLNativeWindow nativeWindow)
{
	EGLDisplay display;
	EGLint majorVersion, minorVersion;
	EGLConfig config;
	EGLint numConfigs;
	EGLSurface surface;
	EGLContext context;

	const EGLint configAttribs[] =
	{
		EGL_RENDER_TYPE, EGL_WINDOW_BIT,
		EGL_RED_SIZE, 8,
		EGL_GREEN_SIZE, 8,
		EGL_BLUE_SIZE, 8,
		EGL_DEPTH_SIZE, 24,
		EGL_NONE
	};

	const EGLint contextAttribs[] =
	{
		EGL_CONTEXT_CLIENT_VERSION, 3,
		EGL_NONE
	};

	/* get EGL display */
	display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
	if (display == EGL_NO_DISPLAY)
	{
		return EGL_FALSE;
	}

	/* init EGL display */
	if (!eglInitialize(display, &majorVersion, &minorVersion))
	{
		return EGL_FALSE;
	}

	/* check and choose EGL config */
	if (!eglChooseConfig(display, configAttribs, &config, 1, &numConfigs))
	{
		return EGL_FALSE;
	}

	/* create EGL surface */
	surface = eglCreateWindowSurface(display, config, nativeWindow, NULL);
	if (surface == EGL_NO_SURFACE)
	{
		return EGL_FALSE;
	}

	/* cteate EGL context, no context sharing */
	context = eglCreateContext(display, config, EGL_NO_CONTEXT, contextAttribs);
	if (context == EGL_NO_CONTEXT)
	{
		return EGL_FALSE;
	}

	/* select context */
	if (!eglMakeCurrent(display, surface, surface, context))
	{
		return EGL_FALSE;
	}

	return EGL_TRUE;
}

```

> Reference: 《OpenGL ES 3.0 编程指南》