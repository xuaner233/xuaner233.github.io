---
layout:      post
title:       "Deploy your own Opengrok"
subtitle:    "大型项目代码浏览利器 之 Opengrok"
date:	       2018-01-31
author:      "Xiaoxuan Liu"
header-img:  ""
header-mask: 0.3
catalog:     true
categories:
    - 实用工具
tags:
    - Opengrok
    - Tomcat
    - Ubuntu
---

***

### [Opengrok](http://oracle.github.io/opengrok/) 正如它自己的介绍所说：
> A wicked fast source browser

在浏览大型项目代码时，Source Insight 之类工具往往需要较长时间索引或者卡顿，且跨平台有局限性。
因此，搭建网站式代码浏览工具Opengrok便成为一种有效的解决方案。

废话不多说，先上官方效果图：

![Opengrok](http://oracle.github.io/opengrok/images/opengrok-scr1.png)


***本文主要记录在利用Opengrok 部署多项目时的一些细节，方便初次搭建的童鞋们***

***

# Part 1： 安装

### 安装列表： 
- exuberant-ctags
- JDK8
- Tomcat
- Opengrok

## exuberant-ctags

```
sudo apt-getinstall exuberant-ctags
```

## JDK 8
本次安装JDK 版本为1.8，采用源安装方式：

```
sudo add-apt-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java8-installer
sudo apt-get install oracle-java8-set-default
```

> 注：webupd8 网站提供许多稳定packages，受信任程度较高，此处直接采用源安装

## Tomcat

从官网下载Tomcat 安装包(我用的是8.5.20版本)至本地：[Tomcat](http://tomcat.apache.org/)
并解压至(建议） `/opt/` 路径下。
然后进入Tomcat的bin目录，启动Tomcat服务
> 注：若要停止tomcat，则可运行 `bin` 目录下的shutdown.sh

```
/opt/tomcat/apache-tomcat-8.5.20/bin/$ startup.sh
```


**打开浏览器，输入网址：http://localhost:8080， 若出现以下界面，说明tomcat启动成功。**

![Tomcat welcome](/imgs/tomcat-startup.png)

## Opengrok

### 安装

> 官方链接：https://github.com/oracle/opengrok/wiki/How-to-install-OpenGrok

下载官方安装包，并解压至 `/opt/` 目录下，然后copy Opengrok 的lib目录下的 `source.war` 至 **Tomcat** 的 `webapps/`目录，**Tomcat** 会自动解析 `source.war` 文件并生成 `source` 目录。

这时，访问 http://localhost:8080/source/ 即可看到 **Opengrok** 的默认搜索界面。

### 索引流程（详细见下文 Part2 部分）
进入Opengrok 安装目录下的 `bin` 目录下，然后部署，索引：

```
./OpenGrok deploy
./OpenGrok index [src_path]
```

index 即建立索引，时间根据项目源码大小而定，一般情况Android源码大小的项目约半个小时（个人电脑测试结果）。

***

# Part 2：部署

在使用Opengrok进行多项目部署时，将各个项目的源代码放到不同目录，分成不同 Project 来分别索引是比较好的解决方案。在多项目部署过程中，有些关键参数需要进行设置，如下表：

| 参数 | 参数值 | 参数说明 |
|---|---|---|
| OPENGROK\_WEBAPP\_NAME | {your project name} | 项目名字，默认脚本中不支持除source以外的名字，需加入此参数支持对其他webapp name的拓展 |
| OPENGROK\_WEBAPP\_CONTEXT | {your project name} | 项目上下文，用来指定源码搜索中项目目录的名称，如无指定，则为默认:8080/source/ 路径 |
| OPENGROK\_TOMCAT\_BASE | {tomcat install dir} | Tomcat 根目录，用以指定 Tomcat 安装目录 |
| OPENGROK\_INSTANCE\_BASE | {instance base dir} | Instance 目录存放Opengrok index 产生的数据结构并供后续 search 使用， 默认为`/var/opengrok`， 使用自定义路径时需指定相应路径 |
| OPENGROK\_VERBOSE | true | 在opengrok.jar 中开启 Verbose 模式 |


### 1. 准备目录：

下面是我自己的目录，**仅供参考**，后续操作均在我个人目录基础上进行。

| 名称 | 路径 |
| --- | --- |
| Tomcat 根目录 | /opt/tomcat/apache-tomcat-8.5.20 |
| Opengrok 根目录 | /opt/opengrok/opengrok-1.1-rc14 |
| Opengrok 源码目录 | /opt/opengrok/src_root |
| Opengrok 实例目录 | /opt/opengrok/instance_base |


### 2. 配置 `OpenGrok` 脚本，增加 OPENGROK\_WEBAPP\_NAME 支持

1) OpenGrok脚本中默认不支持新的webapp name，因此需在 `bin/OpenGrok` 脚本中添加变量 OPENGROK\_WEBAPP\_NAME。

```bash
    OPENGROK_INSTANCE_BASE="${OPENGROK_INSTANCE_BASE:-/var/opengrok}"
    # add support for webapp name config
    OPENGROK_WEBAPP_NAME="${OPENGROK_WEBAPP_NAME:-source}"
    LOGGER_CONFIG_FILE="logging.properties"
```

2) 在 `bin/OpenGrok` 中的 `StdInvocation()` 函数中添加 “-w ${OPENGROK\_WEBAPP\_NAME}” 参数（即启动 Java -jar opengrok.jar的时候加入参数）。

```bash
StdInvocation()
{
    CommonInvocation		\
	-W ${XML_CONFIGURATION}	\
	${SCAN_FOR_REPOSITORY}	\
	${ENABLE_PROJECTS}	\
	-s "${SRC_ROOT}"	\
	-d "${DATA_ROOT}"	\
	# add support for webapp name config
	-w ${OPENGROK_WEBAPP_NAME} \ 
	"${@}"
}
```

### 3. 部署并索引

配置工作完成后，即可愉快的进行部署索引了，以android 和 kernel 代码为例，根据版本分别为 Android 和 kernel 建立独立的index，则可将 `src_root` 和 `instance_base` 目录创建为：

```
src_root
 |-- android
      |-- android-8.0.0_r1
      |-- android-8.1.0_r1
      `-- android-o-mr1-fsk
 `-- kernels
      |-- android-hikey-linaro-4.4
      `-- android-hikey-linaro-4.9

```

#### 1） 根据源码目录建立索引：

***Android***

```bash
export OPENGROK_INSTANCE_BASE="/opt/opengrok/instance_base/android"
export OPENGROK_WEBAPP_NAME="android"
export OPENGROK_WEBAPP_CONTEXT="android"
export OPENGROK_TOMCAT_BASE="/opt/tomcat/apache-tomcat-8.5.20"
export OPENGROK_VERBOSE=true
/opt/opengrok/opengrok-1.1-rc14/bin/OpenGrok deploy
/opt/opengrok/opengrok-1.1-rc14/bin/OpenGrok index /opt/opengrok/src_root/android
```

***kernels***

```bash
export OPENGROK_INSTANCE_BASE="/opt/opengrok/instance_base/kernels"
export OPENGROK_WEBAPP_NAME="kernels"
export OPENGROK_WEBAPP_CONTEXT="kernels"
export OPENGROK_TOMCAT_BASE="/opt/tomcat/apache-tomcat-8.5.20"
export OPENGROK_VERBOSE=true
/opt/opengrok/opengrok-1.1-rc14/bin/OpenGrok deploy
/opt/opengrok/opengrok-1.1-rc14/bin/OpenGrok index /opt/opengrok/src_root/kernels
```

#### 2） 更新Tomcat webapp 目录

将tomcat 安装目录 webapps 目录下（/opt/tomcat/apache-tomcat-8.5.20/webapps）的`source.war` 分别复制命名为 `android.war` 和 `kernels.war`，tomcat 会根据新的`.war`文件生成相应的网页目录。

```
webapps
|-- ROOT/
|-- android/
|-- android.war
|-- docs/
|-- examples/
|-- host-manager/
|-- kernels/
|-- kernels.war
|-- manager/
|-- source/
`-- source.war
```

#### 3） 修改每个project 目录下的 `WEB-INF/web.xml` 文件，指定 Opengrok 的 configuration.xml。

`android/WEB-INF/web.xml` 和 `kernels/WEB-INF/web.xml` 文件中的：

```
  <context-param>
    <description>Full path to the configuration file where OpenGrok can read its configuration</description>
    <param-name>CONFIGURATION</param-name>
    <param-value>/var/opengrok/etc/configuration.xml</param-value>
  </context-param>
```

将指定路径分别改为 OPENGROK_INSTANCE_BASE 下面各 Project 对应的路径，即，将`/var/opengrok/` 分别改为：

`/opt/opengrok/instance_base/android/`
`/opt/opengrok/instance_base/kernels/`


**至此，多项目 Opengrok 部署完成，可分别浏览 http://localhost:8080/android 或 http://localhost:8080/kernels 进行访问使用。**

***
### 后记： 附上个人使用的 `index` 脚本，仅供参考

```bash
#!/bin/bash

TOMCAT_WEBAPPS_DIR=/opt/tomcat/apache-tomcat-8.5.20/webapps
INSTANCE_BASE_DIR=/opt/opengrok/instance_base
SOURCE_ROOT_DIR=/opt/opengrok/src_root

DIR_LIST=`ls ${SOURCE_ROOT_DIR}`


info() {
    echo "======================================================="
    echo -e "\033[1;36m$1\033[0m"
    echo "======================================================="
}

update_war() {
    cd ${TOMCAT_WEBAPPS_DIR}
    if [ ! -f ${1}.war ]
    then
        cp source.war ${1}.war
        echo "Sleep 10 sec for tomcat to generate web page dir"
        sleep 10
    fi

    if [ -d ${1} ]
    then
        if [ ! `sed -n "8, 8p" ${1}/WEB-INF/web.xml | grep ${1}` ]
        then
            info "Update the configuration.xml"
            sed -i -e "i8s:${INSTANCE_BASE_DIR}/[a-z]*/etc/configuration.xml/:${INSTANCE_BASE_DIR}/${1}/etc/configuration.xml:g" WEB-INF/web.xml
        fi
    fi

    cd -
}

index_dir() {
    info "update ${1} index"
    export OPENGROK_INSTANCE_BASE="${INSTANCE_BASE_DIR}/${1}"
    export OPENGROK_WEBAPP_NAME="${1}"
    export OPENGROK_WEBAPP_CONTEXT="${1}"
    export OPENGROK_TOMCAT_BASE="/opt/tomcat/apache-tomcat-8.5.20"
    export OPENGROK_VERBOSE=true

    ./OpenGrok deploy
    info "sleep 5 sec for config update"
    sleep 5
    ./OpenGrok index ${SOURCE_ROOT_DIR}/${1}

    # update the source.war to different dir
    info "Index ${1} done! Begin to config tomcat web page"
    update_war ${1}
}

if [ $# == 0 ]
then
    for dir in ${DIR_LIST}
    do
        index_dir ${dir}
    done
else
    echo ${DIR_LIST} | grep ${1}
    if [ $? -eq 0 ]
    then
        index_dir ${1}
    else
        echo "Please input right dir to index!"
        exit
    fi
fi
```