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
