---
layout: post
title:  "Make VIM a IDE (Source Insight)"
subtitle: 将 vim 打造成自己的 IDE
date:	2017-08-08
categories: jekyll blog
---




***


### 插件列表：ctags + cscope + taglist + NERDTree + srcexpl + trinity

## 1. ctags
ctags 可用于简单的函数、变量跳转，在比较小的工程中，熟练使用ctags 可以大大提高浏览函数效率。

### 安装

```
sudo apt-get install ctags
```

### 使用
进入工程顶层目录，使用下面命令产生ctags文件用于快速检索

```
$ ctags -R --c++-kinds=+p --fields=+iaS --extra=+q ./
```

ctags参数：

- \-R:				递归生成

- \-\-c++-kinds=+p:	C++ 语法

- \-\-fields=+iaS:	指定tags的可用拓展域，具体参数如下

	- i: 继承信息(Inheritance information)

	- a: 类成员的访问控制信息(Access of class members)

	- S: 常规签名信息，如函数原型或参数表(Signature of routine)

- \-\-extra=+q:		q \-\-包含类成员信息

### vim 设置
命令结束后，会在当前目录下产生`tags` 文件，同时，VIM 需要知道tags文件可以在哪里找到，因此可在vimrc里添加下面设置

```
set tags=./tags;
```


设置之后，vim会在当前目录下检索tags文件，若当前目录没有则向上递归查找。

## 2. cscope
### 安装
cscope 是ctags的增强版，对于代码浏览中的函数跳转，symbol以及文件查询非常方便。

```
sudo apt-get install cscope
```

### 使用
进入项目的根目录，运行：

```
cscope -Rbqk
```

参数说明：

- R： 递归建立索引
- b： 仅建立关联数据库，索引完成后退出，不显示界面
- q： 生成csope.in, csope.out 文件，加快索引速度
- k： 不搜索include到文件的函数及符号

### vim 设置
命令结束后会在当前目录产生cscope.* 文件，同样在vimrc 里添加如下设置：

```
set cscopetag
set csto=0

if filereadable("cscope.out")
   cs add cscope.out
elseif $CSCOPE_DB != ""
    cs add $CSCOPE_DB
endif
set cscopeverbose

" find symbol
nmap zs :cs find s <C-R>=expand("<cword>")<CR><CR>
" find defination
nmap zg :cs find g <C-R>=expand("<cword>")<CR><CR>
" find usage
nmap zc :cs find c <C-R>=expand("<cword>")<CR><CR>
" find string
nmap zt :cs find t <C-R>=expand("<cword>")<CR><CR>
" find with grep, similar to egrep
nmap ze :cs find e <C-R>=expand("<cword>")<CR><CR>
" find file
nmap zf :cs find f <C-R>=expand("<cfile>")<CR><CR>
" find files include current file
nmap zi :cs find i <C-R>=expand("<cfile>")<CR>$<CR>
" find function
nmap zd :cs find d <C-R>=expand("<cword>")<CR><CR>
```

注：最后部分为映射快捷键，例如用`zs` 取代 vim 里键入 `:cs f s {name}`。
各项快捷键对应指令如下（C 语言）：

1. cs find s {name} : 符号查找 -- symbol
2. cs find g {name} : 定义查找 -- definition
3. cs find c {name} : 函数调用 -- call/invoke
4. cs find t {name} : 字符查找 -- string
5. cs find e {name} : 正则查找 -- egrep
6. cs find f {name} : 文件查找 -- file
7. cs find i {name} : 文件引用 -- include 该文件的文件
8. cs find d {name} : 函数调用 -- 该函数所调用函数

## 3. taglist

taglist 会在vim中新开一窗口，将当前文件中的宏定义、变量、函数定义等显示。
### 安装
下载plugin 文件，官网链接：
https://sourceforge.net/projects/vim-taglist/files/vim-taglist/

解压文件，将`plugin/taglist.vim` 复制到 `~/.vim/plugin/` 文件下， `doc/taglist.txt` 复制到 `~/.vim/doc/` 目录

### vim设置

在 `vimrc`中添加如下设置：

```
" map shortcut to "F7"
nmap <F7> :TlistToggle<CR><CR>

" just show the current file
let Tlist_Show_One_File=1

" exit vim when only taglist window
let Tlist_Exit_OnlyWindow=1

" set update time to 100ms
set ut=100
```

## 4. NERDTree

NERDTree 在vim中新开一窗口，显示目录下文件(夹)

### 安装
下载 plugin 文件，官网链接：
https://vim.sourceforge.io/scripts/script.php?script_id=1658

将压缩包解压到 `~/.vim` 文件夹下，会将 `NERD_tree.vim` 解压到 `~/.vim/plugin/` 并将 `NERD_tree.txt` 解压到 `~/.vim/doc/`。 其他文件如`lib` 等文件夹则会解压到`.vim/`目录下。

### vim 设置
在 `vimrc` 中添加如下设置：

```
" map shortcut to "F9"
nmap <F9> :NERDTreeToggle<CR><CR>

" set the window right side
let NERDTreeWinPos=1

" set the window size
let NERDTreeWinSize=31
let NERDTreeAutoCenter=1

let g:NERDTreeDirArrows=1
let g:NERDTreeDirArrowExpandable = '▸'
let g:NERDTreeDirArrowCollapsible = '▾'
```

## 5. srcexpl
srcexpl (Source Explorer) 能将当前所在的函数及变量的定义及时显示出来。

**注： 该插件较耗资源，请按需选择**

### 安装
下载plugin文件，官网链接：
https://vim.sourceforge.io/scripts/script.php?script_id=2179

将压缩包解压到 `~/.vim` 文件夹下，会将 `srcexpl.vim ` 解压到 `~/.vim/plugin/` 并将 `srcexpl.txt ` 解压到 `~/.vim/doc/`

### vim 设置

```
" map shortcut to "F8"
nmap <F8> :SrcExplToggle<CR>

" set the height of window
let g:SrcExpl_winHeight = 6

" Set 100 ms for refreshing the Source Explorer
let g:SrcExpl_refreshTime = 100

" Set "Enter" key to jump into the exact definition context
let g:SrcExpl_jumpKey = "<ENTER>"

" Set "Space" key for back from the definition context
let g:SrcExpl_gobackKey = "<SPACE>"

" In order to avoid conflicts, the Source Explorer should know what plugins
" except itself are using buffers. And you need add their buffer names into
" below listaccording to the command ":buffers!"
let g:SrcExpl_pluginList = [
    \ "__Tag_List__",
    \ "_NERD_tree_"
    \]


```

## 6. trinity
trinity 是vim中的一款将taglist, nerdtree, srcexpl 同时调用的plugin，实现了一键打开三个plugin的功能。

### 安装
下载plugin文件，官网链接：
https://vim.sourceforge.io/scripts/script.php?script_id=2347

将压缩包中`Trinity`目录下文件解压到 `~/.vim` 文件夹下，会将 `trinity.vim `和`NERD_tree.vim`解压到 `~/.vim/plugin/`。

### vim 设置

```
" Open and close all the three plugins on the same time, map to F10
nmap <F10>   :TrinityToggleAll<CR>
```


### 至此，vim 设置已全部完成，完成后效果如下图：
![Vim IDE](/imgs/vim_IDE.png)