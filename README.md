<<<<<<< HEAD
Allyourphotos.org
=================

An express, node, passport, mongoose app to import and manage all your photos in a web environment.

License
=======
This project is not open source and thus not licenced for any use without explicit authorization from the authors: Christian Landgren and Henrik Landgren

Server
======

Code structure
--------------

Site related parts:
* Views
* Routes

Database related parts:
* Models

Authorization parts (based on Passport):
* Auth
* Connectors

Worker related parts
* Jobs
* Connectors


Client
======

Contains all client code


Rules
=====

Regler:
- - - -
1. Varje gruppering ska vara mellan 24 och 36 bilder. Hämta 36 per grupp från databasen, välj ut 24 på klientsidan.
2. Dublettbilder bör sorteras bort så tidigt som möjligt
3. När grupperingen innehåller för många bilder visas endast de bästa bilderna ut (topplista)
4. Nya bilder är viktigare än gamla

Zoomnivå:
- - - -

Liv - 24 bilder per epok i livet (decennier?), c:a 3 grupperingar = 72 bilder
Begränsning: DateTime.Min - DateTime.Now

År - 24 bilder per år, c:a 24 grupperingar = top 500
Begränsning: DateTime.Min - DateTime.Now


Månad - 24 bilder per månad, c:a 12 grupperingar = 250
Begränsning: DateTime.Now.AddYears(-1) - DateTime.Now


Helg - 24 bilder per tre dagar
Dag - 24 bilder per dag
Händelse - 24 bilder per sammahållen tidsperiod
Alla - 24 bilder per gruppering



1 = 12 bilder per år = 1 gruppering för två år

5 = 24 bilder per år = 1 gruppering per år

10 = 5 bilder per månad = 1 gruppering per månad

20 = 5 bilder per dag = max 

30 = 20 bilder per dag

50 = 50 bilder per dag

99 = max 100 bilder per dag

100 = alla bilder



- - - -

Datum       Klockslag    Interestingness  Zoom1     Zoom5
2012-09-01  11:11:33     11     
2012-09-01  11:11:33     55
2012-09-01  11:11:33     22
2012-09-01  11:11:33     13
2012-09-01  11:11:33     99               Ja?
2012-09-01  11:11:34     92               Nej?

- - - -
=======
Heroku buildpack: Node.js
=========================

This is a [Heroku buildpack](http://devcenter.heroku.com/articles/buildpacks) for Node.js apps.
It uses [NPM](http://npmjs.org/) and [SCons](http://www.scons.org/).

Usage
-----

Example usage:

    $ ls
    Procfile  package.json  web.js

    $ heroku create --stack cedar --buildpack http://github.com/heroku/heroku-buildpack-nodejs.git

    $ git push heroku master
    ...
    -----> Heroku receiving push
    -----> Fetching custom buildpack
    -----> Node.js app detected
    -----> Vendoring node 0.4.7
    -----> Installing dependencies with npm 1.0.8
           express@2.1.0 ./node_modules/express
           ├── mime@1.2.2
           ├── qs@0.3.1
           └── connect@1.6.2
           Dependencies installed

The buildpack will detect your app as Node.js if it has the file `package.json` in the root.  It will use NPM to install your dependencies, and vendors a version of the Node.js runtime into your slug.  The `node_modules` directory will be cached between builds to allow for faster NPM install time.

Node.js and npm versions
------------------------

You can specify the versions of Node.js and npm your application requires using `package.json`

    {
      "name": "myapp",
      "version": "0.0.1",
      "engines": {
        "node": ">=0.4.7 <0.7.0",
        "npm": ">=1.0.0"
      }
    }

To list the available versions of Node.js and npm, see these manifests:

http://heroku-buildpack-nodejs.s3.amazonaws.com/manifest.nodejs
http://heroku-buildpack-nodejs.s3.amazonaws.com/manifest.npm

Hacking
-------

To use this buildpack, fork it on Github.  Push up changes to your fork, then create a test app with `--buildpack <your-github-url>` and push to it.

To change the vendored binaries for Node.js, NPM, and SCons, use the helper scripts in the `support/` subdirectory.  You'll need an S3-enabled AWS account and a bucket to store your binaries in.

For example, you can change the default version of Node.js to v0.6.7.

First you'll need to build a Heroku-compatible version of Node.js:

    $ export AWS_ID=xxx AWS_SECRET=yyy S3_BUCKET=zzz
    $ s3 create $S3_BUCKET
    $ support/package_nodejs 0.6.7

Open `bin/compile` in your editor, and change the following lines:

    DEFAULT_NODE_VERSION="0.6.7"
    S3_BUCKET=zzz

Commit and push the changes to your buildpack to your Github fork, then push your sample app to Heroku to test.  You should see:

    -----> Vendoring node 0.6.7
>>>>>>> faee766226ff5e92b1057e2b4a2353814f348834
