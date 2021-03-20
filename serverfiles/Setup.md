# Requirements
```bash
$ sudo apt-get update && apt-get install python3-pip apache2 libapache2-mod-wsgi-py3
$ sudo pip3 install virtualenv
$ cd monopoly-1
$ virtualenv monopolyenv
$ source monopolyenv/bin/activate
$ pip install -r requirements.txt
$ ./manage.py migrate
```

# Setup **Supervisor** using:
```bash
# cd monopoly-1
$ supervisord -c supervisord.conf
# To check if supervisord has started use command
$ sudo supervisorctl status
# To check if asgi server is working correctly use command
$ cat /tmp/daphne.out.log
# To kill supervisor use command
# sudo kill -s SIGTERM $(sudo supervisorctl pid)
```
# Setup **Apache**:
```bash
# cd monopoly-1
# Move apache file to required location
$ sudo cp 000-default.conf /etc/apache2/sites-available/000-default.conf
```
## Give permission to apache to access required files
```bash
# cd monopoly-1
$ chmod 664 db.sqlite3
$ sudo chown :www-data db.sqlite3
$ sudo chown :www-data ~/monopoly-1
# To start daphne server
# $ daphne webapps.asgi:channel_layer
```

## Configure Apache
```bash
$ a2enmod rewrite
$ a2enmod proxy
$ a2enmod proxy_http
$ a2enmod proxy_wstunnel
# To cache staticfiles so that they are loaded faster
# Additional setup needs to be done according to this [Digital Ocean blog](https://www.digitalocean.com/community/tutorials/how-to-configure-apache-content-caching-on-ubuntu-14-04)
$ a2enmod file_cache
```

## Restart Apache2 and visit the the public ip of the VM to verify success
```bash
$ sudo service apache2 restart
# To check if apache has been setup successfully
$ cat /var/log/apache2/error.log
```
