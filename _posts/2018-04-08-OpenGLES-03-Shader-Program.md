---
layout:      post
title:       "OpenGL ES 学习笔记 - Shader & Program"
subtitle:    "着色器和程序对象"
date:	       2018-04-08
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

本节主要讨论如何创建着色器、编译并将其连接到程序对象这一过程的完整细节，主要部分为：

- 着色器和程序对象概述
- 创建和编译着色器
- 创建和链接程序
- 获取和设置统一变量
- 获取和设置属性
- 着色器编译器和程序二进制代码


## 1. 着色器和程序

OpenGL ES 中，需要创建两个对象才能用着色器进行渲染：着色器对象(Shader)和程序对象(Program)。这两个对象可以类比C 语言中的编译器和链接程序来理解，在实际过程中，源代码提供给着色器对象进行编译，然后生成一个目标格式，之后，着色器对象便可以链接到程序对象。在OpenGL ES 中，程序对象必须只能链接一个顶点着色器（Vertex Shader）和片段着色器（Fragment Shader），不多也不少，这点与OpenGL 有所差异。

获得链接的着色器对象一般经过以下6个步骤：

	1. 创建一个顶点着色器对象和片段着色器对象；
	2. 将源代码链接到每个着色器对象；
	3. 编译着色器对象；
	4. 创建一个程序对象；
	5. 将编译后的着色器对象链接到程序对象；
	6. 链接程序对象。

若上述步骤中没有错误，那么程序对象便可用来绘图。

### 创建和编译着色器

创建着色器的函数：

> GLuint glCeateShader(GLenum type)

- type: 创建的着色器类型，有 GL_VERTEX_SHADER 和 GL_FRAGMENT_SHADER
- 返回值：创建成功的着色器对象句柄

删除着色器的函数：

> void glDeleteShader(GLuint shader)

- shader: 要删除的着色器对象句柄
- 注：如果一个着色器已经链接到一个对象，那么调用 `glDeleteShader` 不会立即删除着色器，而是标记着色器为删除，在着色器没有链接到任何程序对象时将其删除。

创建着色器之后，便需要给着色器提供着色器源代码：

> void glShaderSource(GLuint shader, GLsizei count, const GLchar **string, const GLint *length)

- shader: 着色器对象句柄
- count: 着色器字符串的数量。可以有多个字符串，但每个着色器只能有一个main函数
- string: 指向保存数量为count的着色器源字符串的数组指针。
- length: 指向保存每个着色器字符串大小并且元素数量为count的整数数组的指针，即string中每个指针的字符串长度。length=NULL，着色器字符串将被认定为NULL；否则，length中每个元素保存对应于string数组中着色器的字符数量。若所有元素的length均小于0，则string 被认定为NULL。

下一步，便是编译着色器：

> glCompileShader(GLuint shader)

编译完成之后，可以用`glGetShaderiv` 函数check 有没有错误：

> void glGetShaderiv(GLuint shader, GLenum pname, GLint *params)

- shader: shader 句柄
- pname: 获取信息的参数，包含：GL_COMPILE_STATUS, GL_DELETE_STATUS, GL_INFO_LOG_LENGTH, GL_SHADER_SOURCE_LENGTH, GL_SHADER_TYPE
- params: 指向查询结果存储位置的指针

另外，也可用`glGetShaderInfoLog` 检索信息日志：

> void glGetShaderInfoLog(GLuint shader, GLsizei maxLength, GLsizei *length, GLchar *infoLog)

- shader: shader 句柄
- maxLength: 保存日志信息的缓冲区大小
- length: 写入信息日志长度(不包含null终止符)，可为NULL
- 指向保存信息日志缓冲区的指针

#### 程序示例：

```c
GLuint LoadShader(GLenum type, const char *shaderSrc)
{
	GLuint shader;
	GLint compiled;

	// Create shader obj
	shader = glCreateShader(type)

	if( 0 == shader )
	{
		return 0;
	}

	// load shader source
	glShaderSource(shader, 1, &shaderSrc, NULL);

	// compile shader
	glCompileShader(shader);

	// check compile
	glGetShaderiv(shader, GL_COMPILE_STATUS, &compiled);

	if( !compiled )
	{
		// get failed detail
		GLint infoLen = 0;

		glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &infoLen);

		if( infoLen > 1)
		{
			char* infoLog = malloc(sizeof(char) * infoLen);
			glGetShaderInfoLog(shader, infoLen, NULL, infoLog);

			printf("Error compiling shader: \n\s\n", infoLog);

			free(infoLog);
		}

		glDeleteShader(shader);
		return 0;
	}

	return shader;
}
```

### 创建和链接程序

创建程序对象：

> GLuint glCreateProgram()

删除程序对象：

> void glDeleteProgram(GLuint program)

创建程序对象后，下一步便是链接着色器：

> void glAttachShader(GLuint program, GLuint shader)

- 该函数将shader链接到指定的程序对象。注：shader可以在任何时候链接，链接之前不一定需要编译，甚至源代码都可没有；唯一的要求是，每个program 必须有且只有一个 vertex shader 和一个 fragment shader。

断开shader链接：

> void glDetachShader(GLuint program, GLuint shader)

准备好shader之后，下一步便可以进行程序对象的链接使用：

> void glLinkProgram(GLuint program)

- program链接负责生成最终的可执行程序。链接程序会检查各种对象的数量，确保成功链接。具体地，1）确保vertex shader写入 fragment shader使用的所有vertex shader 输出变量； 2）确保任何在vertex 和 fragment shader 中 都声明的同一变量(Uniform) 和统一变量缓冲区的类型相符；3）确保最终的程序符合具体实现的限制，例如属性、统一变量或输入输出着色器变量的数量。
- 一般来说，链接阶段是生成在硬件上运行的最终硬件指令的阶段。

链接完成后，可用`glGetProgramiv` 检查链接状态：

> void glGetProgramiv(GLuint program, GLenum pname, GLint *params)

- pname: 获取信息的参数
- params: 指向查询结果的指针
- OpenGL ES中大部分信息检查函数都遵循相似规则，具体检查的内容（pname）请参见文首链接。

另，我们同样需要获取链接日志来追踪链接状态：

> void glGetProgramInfoLog(GLuint program, GLsizei maxLength, GLsizei *length, GLchar *infoLog)

- maxLength: 存储日志信息的缓冲区大小
- length: 写入信息日志的长度，可为NULL
- infoLog: 指向存储日志信息缓冲区的指针

链接成功之后，我们需要检查程序对象是否有效。（例如纹理没有绑定，则链接行为无法得知该状态）

> void glValidateProgram(GLuint program)

- 校验结果可用`glGetProgramiv`查询：GL_VALIDATE_STATUS
- 注：该操作较慢，建议仅用于调试使用；实际过程中该函数使用较少。

当当当当！马上到最后一步了，将该program 设置为当前活动程序，然后就可以进行渲染了：

> void glUseProgram(GLuint program)

#### 程序示例：

```c
GLboolean InitProgram(GLuint vShader, GLuint fShader)
{
	GLint checkInfo = 0;

	// create program obj
	GLuint programObj = glCreateProgram();

	if( 0 == programObj )
	{
		return 0;
	}

	glAttachShader(programObj, vShader);
	glAttachShader(programObj, fShader);

	// link
	glLinkProgram(programObj)

	// check link
	glGetProgramiv(programObj, GL_LINK_STATUS, &checkInfo);

	if( !checkInfo )
	{
		// get failure detailed info
		GLint infoLen = 0;

		glGetProgramiv(programObj, GL_INFO_LOG_LENGTH, &infoLen);
		if( infoLen > 1)
		{
			char *infoLog = malloc(sizeof(char) * infoLen);

			glGetProgramInfoLog(programObj, infoLen, NULL, infoLog);

			printf("Error linking program: \n\s\n", infoLog);

			free(infoLog);
		}

		glDeleteProgram(programObj);
		return FALSE;
	}

	// after sucessced linking, you may want to attach textue or other operation

	// use program obj
	glUseProgram(programObj);
}
```

## 2. 统一变量和属性

一旦链接程序对象后，便可以在对象上进行各种查询。首先可能用到的便是对程序中活动的统一变量`(uniform)`的查询。

统一变量被组合成两类统一变量块：

1. 命名统一变量块。统一变量的值由统一变量缓冲区对象支持。可以理解为结构体，示例如下：

```
uniform TransformBlock
{
	mat4 matViewProj;
	mat3 matNormal;
	mat3 matTexGen;
}
```

2. 默认统一变量块。用于在命名统一变量块之外声明的统一变量。示例如下：

```
uniform mat4 matViewProj;
uniform mat3 matNormal;
uniform mat3 matTexGen;
```

注：统一变量如果在顶点着色器和片段着色器中均有声明，则声明类型必须相同，且其值也相同，即为同一统一变量。

### 2.1 获取和设置统一变量

查询之前，首先要获得程序中活动的统一变量列表，此时可用

> void glGetProgramiv(program, GL_ACTIVE_UNIFORMS, *params)

获得程序中统一变量的数量。

活动统一变量：统一变量被程序使用，就认为它是“活动”的。

获得统一变量细节信息API：

> void glGetActiveUniform(GLuint program, GLuint index,
>                    GLsizei bufSize, GLsizei *length,
>                    GLint *size, GLenum *type, GLchar *name)

> void glGetActiveUniformsiv(GLuint program, GLsizei count,
>                       const GLuint *indices,
>                       GLenum pname, GLint *params)

`glGetActiveUniform()` 可获得统一变量的名称、类型以及大小。 `glGetActiveUniformsiv` 则可获得指定的统一变量的信息。

获得统一变量名称之后，我们便可以通过API 获得统一变量的位置`(整数，用于标识统一变量在程序中的位置)`，以进行后续对统一变量的调用。

> GLint glGetUniformLocation(GLuint program, const GLchar* name)

获得统一变量位置后，便可加载统一变量的值。加载统一变量的API根据统一变量类型不同，分别有不同名称：

```
# 命名集
void glUniform{1,2,3,4}{f,i,ui}{v}
void glUniformMatrix{2,3,4}{x2,x3,x4}fv

# 示例
void glUniform4f(GLint location, GLfloat x, GLfloat y, GLfloat z, GLfloat w)
void glUniform4fv
void glUniform4i
void glUniform4iv
void glUniform4ui
void glUinform4uiv

void glUniformMatrix4fv(GLint location, GLsizei count, GLboolean transpose, const GLfloat* value)
void glUniformMatrix4x2fv
void glUniformMatrix4x3fv
```

需要注意的是，`glUniform*` 调用不用程序对象作为参数，而仅以统一变量的位置作为参数。这是因为`glUniform*` 总是在与 `glUseProgram` 绑定的当前程序上操作。同时我们也可以这么说：统一变量值本身保存在程序对象中，其值是程序对象局部所有的。例如，在程序对象中设定一个统一变量的值后，即使使另一个程序处于活动状态，该统一变量值扔保留在原来的程序对象中。

#### 放一个查询统一变量的例子：

```c
GLint maxUniformLen;
GLint numUniforms;
char *uniformName;
GLint index;

glGetProgramiv(progObj, GL_ACTIVE_UNIFORMS, &numUniforms);
glGetProgramiv(progObj, GL_ACTIVE_UNIFORM_MAX_LENGTH, &maxUniformLen);

uniformName = malloc(sizeof(char) * maxUniformLen);
for (index = 0; index < numUniforms; index++)
{
	GLint size;
	GLenum type;
	GLint location;

	// Get the uniform info
	glGetActiveUniform(progObj, index, maxUniformLen, NULL, &size, &type, uniformName);

	// Get the uniform location
	location = glGetUniformLocation(progObj, uniformName);

	switch(type)
	{
		case GL_FLOAT:
			// set opeartion
			break;
		case GL_FLOAT_VEC2:
			//
			break;
		case GL_FLOAT_VEC3:
			//
			break;
		case GL_FLOAT_VEC4:
			//
			break;
		case GL_INT:
			//
			break;
		// ... check other types
		default:
			// default operation
	}
}

```

### 2.2 统一变量缓冲区对象

假设我们要在不同程序之间share统一变量，那么上一节中基于程序内的统一变量则不适用当前问题。可以使用缓冲区对象存储统一变量，从而在着色器之间甚至程序之间share统一变量。这种缓冲区对象，称为统一变量缓冲区对象`(uniform buffer object, UBO)`。使用UBO的好处在于，可以在更新比较大的统一变量块时降低API开销；此外，使用`UBO`也可以增加统一变量的可用存储，因为使用`UBO` 可以不受默认统一变量块的大小限制。

统一变量缓冲区对象的操作API有：

```
glBufferData()
glBufferSubData()
glMapBufferRange()
glUnmapBuffer()
```

在统一变量换冲区对象中，各统一变量在内存中的分步方式如下（对内存不care的可以略过该部分）：

- bool, int, uint 和 float 的成员保存在内存的特定偏移，分别作为单个相同类型的分量
- 基本数据类型 bool, int, uint, float 的向量保存在始于特定内存偏移的连续内存位置，第一个分量数据在最低偏移处
- C列R行的列优先矩阵被当成包含C个浮点列向量的一个数组对待，每个向量包含R个分量，R行C列的行优先矩阵类似。存储时，列向量或行向量连续存储，但在某些实现中可能存在存储缺口。矩阵中两个向量之间的偏移量称作行/列跨距（GL_UNIFORM_MATRIX_STRIDE），可用 `glGetActiveUniformsi v` 查询。
- 标量、向量以及矩阵数组按元素顺序存储，第一个成员位于最低偏移处。数组中每对元素间偏移量是一个常熟，即数组跨距（GL_UNIFORM_ARRAY_STRIDE），可用 `glGetActiveUniformsiv` 进行查询

放一个使用std140布局的命名统一变量块的例子（std140布局请自行学习）：

```c
layout (std140) uniform LightBlock
{
	vec3 lightDirection;
	vec4 lightPosition;
}
```

以及统一变量块所用的GLES相关函数：

```
GLuint glGetUniformBlockIndex(GLuint program, const GLchar *blockName)
void glGetActiveUniformBlockName(GLuint program, GLuint index, GLsizei bufSize, GLsizei *length, GLchar *blockName)
void glGetActiveUniformBlockiv(GLuint program, GLuint index, GLenum pname, GLint *params)
void glUniformBlockBinding(GLuint program, GLuint blockIndex, GLuint blockBinding)
void glUniformBufferRange(GLenum target, GLuint index, GLuint buffer, GLintptr offset, GLsizeptr size)
void glBindBufferBase(GLenum target, GLuint index, GLuint buffer)
```

到这里有很多读者会疑问：怎么突然冒出了个统一变量块的鬼东西？这是因为在实际使用中，统一变量缓冲区对象一般都是命名统一变量块。下面上一个例子说明一下，如何通过命名统一变量块 `LightTransform` 建立一个统一变量缓冲区对象：

```c
GLuint blockId, bufferId;
GLint blockSize;
GLuint bindingPoint = 1;
GLfloat lightData[] =
{
	/* lightDirection (padded to vec4 based on std140 rule) */
	1.0f, 0.0f, 0.0f, 0.0f,
	
	/* lightPosition */
	0.0f, 0.0f, 0.0f, 1.0f
};

/* Retrieve the uniform block index, 'program' and 'LightBlock' are generated before */
blockId = glGetUniformBlockIndex(program, "LightBlock");

/* Associate the uniform block index with a binding point */
glUniformBlockBinding(program, blockId, bindingPoint);

/* Get the size of lightData;
 * Alternatively we also can calculate it using sizeof(lightData) in this example
 * /
glGetActiveUniformBlockiv(program, blockId, GL_UNIFORM_BLOCK_DATA_SIZE, &blockSize);

/* Create and fill a buffer object */
glGenBuffers(1, &bufferId);
glBindBuffer(GL_UNIFORM_BUFFER, bufferId);
glBufferData(GL_UNIFORM_BUFFER, blockSize, lightData, GL_DYNAMIC_DRAW);

/* Bind the buffer object to the uniform block binding point */
glBindBufferBase(GL_UNIFORM_BUFFER, bindingPoint, buffer);
```

### 2.3 获取和设置属性

对于程序对象，除了统一变量信息外，还需要设置顶点属性。对顶点属性的查询可用下面 `glGetActiveAttrib` 进行查询。关于顶点相关，后续会有详细介绍，这里就不展开了。

## 3 着色器编译器（ShaderCompiler）

对 `OpenGL ES` 来说，着色器代码是一种类 `C` 的语言，因此 `OpenGL ES` 必须实现在线着色器编译，即使用 `glGetBooleanv(GL_SHADER_COMPILER, &has_compiler)` 时必须返回 `GL_TRUE`。在使用时，可以通过 `glShaderSource` 来指定着色器源，使用 `glCompileShader` 来进行编译，当编译成功后，可以通过下面的函数来释放编译器资源，告诉 `OpenGL ES` 用户已经完成了shader的编译工作。注意：这个函数只是提示，真正的资源释放取决于 `OpenGL ES` 是否能够释放该资源。

```
void glReleaseShaderCompiler(void)
```

## 4 程序二进制码

program的二进制码是个好东西，它是完全编译、链接后程序的二进制表现形式，可以保存到文件系统中供以后使用，避免在线编译（重复编译）。相关API：

```c
/* 用于检索程序二进制码 */
void glGetProgramBinary(GLuint program, GLsizei bufSize, GLsizei *length, GLenum binaryFormat, GLvoid *binary)

/* 检索二进制码之后，保存二进制码到文件系统 */
void glProgramBinary(GLuint program, GLenum binaryFormat, const GLvoid *binary, GLsizei length)
```


> Reference: 《OpenGL ES 3.0 编程指南》