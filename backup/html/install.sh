#!/bin/bash

case $key in
    -d|--domain)
    DOMAIN="$2"
    shift # past argument
    ;;
    -u|--username)
    USERNAME="$2"
    shift # past argument
    ;;
    -p|--password)
    PASSWORD="$2"
    shift # past argument
    ;;
    -s|--servername)
    SERVERNAME="$2"
    shift # past argument
    ;;
    --default)
    DEFAULT=YES
    ;;
esac
shift # past argument or value
done

