---
layout:      post
title:       "Git Command: 常用命令清单"
subtitle:    "快速学会git命令"
date:	       2018-10-29
author:      "Xiaoxuan Liu"
header-img:  ""
header-mask: 0.3
catalog:     true
categories:
    - 实用工具
tags:
    - Ubuntu, Git
---

> Git 用的比较多，但有许多常用命令可以使工作更高效，Mark 下来以便查询。


## Git 工作模式

两张图说明`Git`工作模式(来源见文末链接)：

- 代码库相关
- 配置代码库
- 分支、标签
- 代码管理
- Gerrit Add on


### 1. 代码库相关

```bash
# 初始化git代码库
$ git init

# clone 代码库
$ git clone [url] [dir_name] [-b branch]
```

### 2. 配置代码库

#### git config

git 的设置文件 `.gitconfig` 可以在用户目录下（全局配置），也可以在项目目录下。默认情况下 git 会先从当前项目中寻找配置文件。另外，项目配置信息可在`.git`目录下找到。

```bash
# 显示当前 git 配置
$ git config [global/--local] --list

# 编辑 git 配置文件
$ git config -e [--global]

$ git config [--global] user.name "name"
$ git config [--global] user.email "email"
```

#### gitignore

git 的配置文件 `.gitignore` 中设定当前项目中可以忽略的change，用来标记不需要添加到项目中的临时文件等。通常情况下，`.gitignore`文件存在于项目根目录中。其语法如下：

- 以 `#` 开头为注释
- 以 `/` 开头表示从 `.gitignore` 当前目录开始生效，不递归
- 可以在后面添加 `/` 来忽略文件夹，例： `out/`表示忽略 `out` 文件夹
- 可用正则匹配来进行筛选
- 可用 `！` 来否定忽略

下面是个.gitignore 的例子

> github 上有个官方的repo：https://github.com/github/gitignore

```bash
# 忽略 .a 文件
*.a

# 否定忽略　lib.a，需要加到git中
!lib.a

# 仅忽略当前文件夹下的 tmp.txt 文件
/tmp.txt

# 忽略 out 目录
out/

# 忽略 doc 目录下所有txt文件，不递归
doc/*.txt
```

**更新 `.gitignore` 配置**

> 有时候我们并非是在一开始就写好了 `.gitignore`　文件，而是在进行项目过程中中途添加的新规则，那么需要同步远程仓库（刷新cache）来使修改的 `.gitignore` 生效。

```bash
$ git rm -r --cached ./
$ git add ./
$ git commit -m "Update .gitignore file"
```

### 3. 分支、标签

#### 分支管理
```bash
# 列出本地分支
$ git branch

# 列出远程分支
$ git branch -r

# 列出所有分支
$ git branch -a

# 新建一个分支，但停留在当前分支
$ git branch [branch]

# 新建一个分支并指向指定commit
$ git branch [branch] [commit]

# 切换到指定分支
$ git checkout [branch]

# 新建一个分支，并切换到该分支
$ git checkout -b [branch]

# 切换到上一个分支
$ git checkout -

# 建立追踪关系至远程分支
$ git branch --set-upstream-to=<upstream>

# 删除分支
$ git branch -d [branch]

# 删除远程分支
$ git branch -dr [remote branch]
```

#### 标签管理
```bash
# 列出所有tag
$ git tag

# 新建一个tag在当前commit
$ git tag [tag]

# 新建一个tag在指定commit
$ git tag [tag] [commit]

# 删除本地tag
$ git tag -d [tag]

# 删除远程tag
$ git push origin :refs/tags/[tagName]

# 查看tag信息
$ git show [tag]

# 提交指定tag
$ git push [remote] [tag]

# 提交所有tag
$ git push [remote] --tags

# 新建一个分支，指向某个tag
$ git checkout -b [branch] [tag]
```

### 4. 代码管理


#### 查看

```bash
# 显示当前分支的版本历史
$ git log

# 显示有变更的文件
$ git status

# 显示commit历史，以及每次commit发生变更的文件
$ git log --stat

# 搜索提交历史，根据关键词
$ git log -S [keyword]

# 显示指定文件相关的每一次diff
$ git log -p [file]

# 显示指定文件是什么人在什么时间修改过
$ git blame [file]

# 显示暂存区和工作区的差异
$ git diff

# 显示工作区与当前分支最新commit之间的差异
$ git diff HEAD

# 显示某次提交的元数据和内容变化
$ git show [commit]
```

#### 文件操作

```bash
# 添加指定文件到暂存区
$ git add [file1] [file2] ...

# 添加指定目录到暂存区，包括子目录
$ git add [dir]

# 添加当前目录的所有文件到暂存区
$ git add .

# 添加每个变化前，都会要求确认
# 对于同一个文件的多处变化，可以实现分次提交
$ git add -p

# 删除工作区文件，并且将这次删除放入暂存区
$ git rm [file1] [file2] ...

# 停止追踪指定文件，但该文件会保留在工作区
$ git rm --cached [file]

# 改名文件，并且将这个改名放入暂存区
$ git mv [file-original] [file-renamed]

# 恢复暂存区的指定文件到工作区
$ git checkout [file]

# 恢复某个commit的指定文件到暂存区和工作区
$ git checkout [commit] [file]

# 恢复暂存区的所有文件到工作区
$ git checkout .

# 重置暂存区的指定文件，与上一次commit保持一致，但工作区不变
$ git reset [file]

# 重置暂存区与工作区，与上一次commit保持一致
$ git reset --hard

# 重置当前分支的指针为指定commit，同时重置暂存区，但工作区不变
$ git reset [commit]

# 重置当前分支的HEAD为指定commit，同时重置暂存区和工作区，与指定commit一致
$ git reset --hard [commit]

# 重置当前HEAD为指定commit，但保持暂存区和工作区不变
$ git reset --keep [commit]

# 新建一个commit，用来撤销指定commit
# 后者的所有变化都将被前者抵消，并且应用到当前分支
$ git revert [commit]

# 暂时将未提交的变化移除，稍后再移入
$ git stash
$ git stash pop
```

#### 提交

```bash
# 提交暂存区到仓库区
$ git commit -m [message]

# 提交暂存区的指定文件到仓库区
$ git commit [file1] [file2] ... -m [message]

# 提交工作区自上次commit之后的变化，直接到仓库区
$ git commit -a

# 提交时显示所有diff信息
$ git commit -v

# 使用一次新的commit，替代上一次提交
$ git commit --amend

# 重做上一次commit，并包括指定文件的新变化
$ git commit --amend [file1] [file2] ...
```

#### 远程同步

```bash
# 下载远程仓库的所有变动
$ git fetch [remote]

# 显示所有远程仓库
$ git remote -v

# 显示某个远程仓库的信息
$ git remote show [remote]

# 增加一个新的远程仓库，并命名
$ git remote add [shortname] [url]

# 更新远程仓库变化到本地
$ git pull

# 更新远程仓库变化到本地，并将本地改动更新至最新仓库版本
$ git pull --rebase

# 取回远程仓库的变化，并与本地分支合并
$ git pull [remote] [branch]

# 上传本地指定分支到远程仓库
$ git push [remote] [branch]

# 强行推送当前分支到远程仓库，即使有冲突
$ git push [remote] --force

# 推送所有分支到远程仓库
$ git push [remote] --all
```

### Gerrit Add on

Gerrit 一般是团队用来共同管理项目的git升级版，基于git，因此大部分操作与git一致，在此仅添加gerrit本身额外的常用命令：

```bash
# 生成 hooks 文件
gitdir=$(git rev-parse --git-dir); scp -p -P 29418 ${USER}@your.gerrit.repo.com:hooks/commit-msg ${gitdir}/hooks/

# push 本地 change 到 gerrit 中
git push origin HEAD:refs/for/{your_branch}
```

> Reference: http://www.ruanyifeng.com/blog/2015/12/git-cheat-sheet.html