Allyourphotos.org
=================

An express, node, passport, mongoose app to import and manage all your photos in a web environment.

License
=======
This project is not open source and thus not licenced for any use without explicit authorization from the authors: Christian Landgren and Henrik Landgren

TODO
====
- filter in view
- nr of photos live
- reverse scroll - fix skip


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
