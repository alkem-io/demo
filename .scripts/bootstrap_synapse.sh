#!/bin/sh

# install dependencies
apt-get update && apt-get install wget -y
wget https://github.com/mikefarah/yq/releases/download/v4.9.6/yq_linux_amd64 -O /usr/bin/yq &&\
chmod +x /usr/bin/yq

# enable registration
yq e '.enable_registration = "true"' -i /data/homeserver.yaml

# prepare variables
secret=${SYNAPSE_REGISTRATION_SHARED_SECRET}
db_user=${POSTGRES_USER}
db_password=${POSTGRES_PASSWORD}
db=${POSTGRES_DB}

# configure shared key
myenv=$secret yq e '.registration_shared_secret = env(myenv)' -i /data/homeserver.yaml

# configure database
yq e '.database.name = "psycopg2"' -i /data/homeserver.yaml
myenv=$db_user yq e '.database.args.user = env(myenv)' -i /data/homeserver.yaml
myenv=$db_password yq e '.database.args.password = env(myenv)' -i /data/homeserver.yaml
myenv=$db yq e '.database.args.database = env(myenv)' -i /data/homeserver.yaml
yq e '.database.args.host = "postgres"' -i /data/homeserver.yaml
yq e '.database.args.cp_min = 5' -i /data/homeserver.yaml
yq e '.database.args.cp_max = 10' -i /data/homeserver.yaml