import json, os, random, datetime, shutil, math
from foods import FOODS
random.seed(20260924)
D = datetime.date
TODAY = D(2026, 9, 24)
WIN_START = TODAY - datetime.timedelta(days=TODAY.weekday()) - datetime.timedelta(weeks=8)   # Mon 27 Jul
WIN_END = TODAY + datetime.timedelta(days=14)
OUT = "./s"
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
FOOD = {f[0]: f for f in FOODS}
iso = lambda d: d.isoformat()

# ---------- foods.json for the page ----------
json.dump([{"n":f[0],"cat":f[1],"per":f[2],"unit":f[3],"kcal":f[4],"p":f[5],"c":f[6],"f":f[7],"d":f[8]} for f in FOODS],
          open("./foods.json","w",encoding="utf-8"), ensure_ascii=False, separators=(",",":"))

# ---------- clients ----------
# name, sex, birth, height, start weight, goal, target, activity, start, freq(days), billing, tags, notes, status
C = [
 ("Ελένη Παπαδοπούλου","Γ","1989-04-12",167,76.4,"Απώλεια βάρους",64,1.375,"2026-01-15",14,"pkg8",["Λακτόζη"],"Γάμος τον Μάιο 2027, θέλει να φτάσει τα 64 kg. Γραφείο, pilates 2×/εβδ. Δυσκολεύεται με τα βραδινά τσιμπολογήματα.","active"),
 ("Νίκος Βασιλείου","Α","1994-09-03",182,71.8,"Αύξηση μυϊκής μάζας",78,1.725,"2026-03-02",21,"pkg4",[],"Βάρη 5×/εβδ., παίρνει κρεατίνη 5 g. Παραλείπει πρωινό — προτιμά shake.","active"),
 ("Μαρία Αντωνίου","Γ","1976-11-21",160,82.3,"Παθολογική διατροφή",70,1.2,"2025-11-04",21,"pkg8",["Hashimoto"],"Hashimoto, Τ4 75 mcg. Συνεργασία με ενδοκρινολόγο (Δρ. Καλλέργης). Χαμηλό αλάτι.","active"),
 ("Γιώργος Δημητρίου","Α","1982-02-08",176,98.2,"Απώλεια βάρους",85,1.55,"2026-05-20",14,"pkg8",[],"Τρέξιμο 3×/εβδ., ημιμαραθώνιος Αθήνας Νοέμβριο. Τρώει συχνά εκτός σπιτιού λόγω δουλειάς.","active"),
 ("Κατερίνα Σιδέρη","Γ","2001-06-30",171,63.0,"Αθλητική διατροφή",None,1.9,"2026-06-11",14,"online",[],"Κολύμβηση, 9 προπονήσεις/εβδ. Εστίαση σε περιπροπονητική διατροφή και ενυδάτωση.","active"),
 ("Θανάσης Κούρκουλος","Α","1968-12-14",174,81.6,"Διατήρηση",None,1.375,"2025-09-08",42,"pkg4",["Υπέρταση"],"Διατήρηση μετά από -14 kg. Έλεγχος κάθε 6 εβδομάδες. Αντιυπερτασικά.","active"),
 ("Ιωάννα Μαυρίδη","Γ","1997-03-25",164,71.0,"Απώλεια βάρους",60,1.55,"2026-07-01",14,"pkg8",["Vegetarian"],"Χορτοφάγος. Παρακολούθηση σιδήρου και B12 — εξετάσεις τον Οκτώβριο.","active"),
 ("Δέσποινα Καραγιάννη","Γ","1985-08-09",165,88.5,"Απώλεια βάρους",72,1.2,"2025-12-01",14,"pkg8",["ΣΠΚΩ"],"Σύνδρομο πολυκυστικών ωοθηκών. Χαμηλός γλυκαιμικός δείκτης. Μετφορμίνη.","active"),
 ("Σοφία Ζαχαρίου","Γ","1992-01-17",169,70.2,"Εγκυμοσύνη",None,1.2,"2026-06-25",21,"pkg4",["Εγκυμοσύνη"],"Εγκυμοσύνη, 2ο τρίμηνο. Στόχος φυσιολογική πρόσληψη βάρους. Φυλλικό οξύ.","active"),
 ("Κώστας Ηλιόπουλος","Α","1979-05-28",179,109.4,"Απώλεια βάρους",92,1.2,"2025-10-13",14,"pkg8",["Διαβήτης τ.2"],"Διαβήτης τύπου 2, HbA1c 7.4% στην έναρξη. Ωράριο βάρδιας.","active"),
 ("Αναστασία Μπέλλου","Γ","1990-10-02",162,68.9,"Απώλεια βάρους",60,1.375,"2026-02-09",14,"pkg4",["Γλουτένη"],"Κοιλιοκάκη — αυστηρά χωρίς γλουτένη. Εκπαιδευτικός.","active"),
 ("Παναγιώτης Ζερβός","Α","1987-07-19",185,86.0,"Αθλητική διατροφή",None,1.725,"2026-04-06",21,"online",[],"Ποδηλασία δρόμου, αγώνες αντοχής. Online από Θεσσαλονίκη.","active"),
 ("Χριστίνα Ρήγα","Γ","1981-03-06",166,79.8,"Απώλεια βάρους",68,1.375,"2026-03-16",14,"pkg8",[],"Δύο παιδιά, περιορισμένος χρόνος για μαγείρεμα. Meal prep Κυριακή.","active"),
 ("Άρης Μακρής","Α","1999-11-11",178,67.4,"Αύξηση μυϊκής μάζας",74,1.725,"2026-05-04",21,"pkg4",[],"Φοιτητής, περιορισμένο budget. Crossfit 4×/εβδ.","active"),
 ("Βασιλική Τσακίρη","Γ","1972-06-22",158,74.6,"Παθολογική διατροφή",66,1.2,"2026-01-26",21,"pkg8",["Χοληστερίνη"],"Υπερχοληστερολαιμία (LDL 188). Εμμηνόπαυση. Περπάτημα καθημερινά.","active"),
 ("Γεωργία Λαμπράκη","Γ","1995-12-30",170,66.2,"Διατήρηση",None,1.55,"2025-11-24",28,"pkg4",[],"Διατήρηση μετά από απώλεια 9 kg. Ενδιαφέρεται για διαισθητική διατροφή.","active"),
 ("Δημήτρης Φραγκιαδάκης","Α","1975-04-03",181,102.8,"Απώλεια βάρους",90,1.2,"2026-06-01",14,"pkg8",[],"Εστιάτορας — ακανόνιστα γεύματα. Υπνική άπνοια, CPAP.","active"),
 ("Αθηνά Κωνσταντίνου","Γ","1988-09-15",163,64.8,"Απώλεια βάρους",58,1.55,"2026-08-03",14,"single",[],"Μετά τον τοκετό (8 μήνες). Θηλάζει — όχι έντονο έλλειμμα.","active"),
 ("Στέφανος Νικολάου","Α","1990-02-27",177,84.1,"Απώλεια βάρους",78,1.375,"2026-08-17",14,"single",[],"Νέος πελάτης, σύσταση από Γιώργο Δημητρίου. Γυμναστήριο 3×/εβδ.","active"),
 ("Ευαγγελία Πάνου","Γ","1966-07-08",161,86.7,"Παθολογική διατροφή",74,1.2,"2025-10-06",21,"pkg8",["Διαβήτης τ.2","Υπέρταση"],"Διαβήτης τ.2 και υπέρταση. Ινσουλίνη βάσης. Μετρήσεις σακχάρου εβδομαδιαία.","active"),
 ("Φωτεινή Σταθοπούλου","Γ","1993-05-14",168,72.5,"Απώλεια βάρους",63,1.375,"2026-04-20",14,"pkg8",["Ξηροί καρποί"],"Αλλεργία σε ξηρούς καρπούς (φουντούκι, καρύδι). Νοσηλεύτρια, βάρδιες.","active"),
 ("Μάνος Ξενάκης","Α","1984-01-21",183,90.3,"Αθλητική διατροφή",86,1.725,"2026-02-23",21,"pkg4",[],"Τένις ερασιτεχνικά, τουρνουά. Θέλει βελτίωση σύστασης σώματος.","active"),
 ("Ραφαέλα Γιαννακοπούλου","Γ","2000-08-25",173,61.4,"Αύξηση μυϊκής μάζας",65,1.55,"2026-07-13",21,"online",["Vegan"],"Vegan. Χρειάζεται επαρκή πρωτεΐνη και B12. Online από Πάτρα.","active"),
 ("Μυρτώ Αλεξίου","Γ","1986-02-04",164,78.9,"Απώλεια βάρους",66,1.2,"2026-09-03",14,"single",[],"Πρώτη επαφή τον Σεπτέμβριο. Συναισθηματική υπερφαγία — συνεργασία με ψυχολόγο.","active"),
 ("Νεφέλη Χατζή","Γ","1998-04-18",167,58.2,"Αθλητική διατροφή",None,1.9,"2026-03-09",21,"pkg4",[],"Χορεύτρια. Προσοχή σε επαρκή ενέργεια (RED-S). Παρακολούθηση κύκλου.","active"),
 ("Δήμητρα Ορφανού","Γ","1979-10-10",159,69.4,"Διατήρηση",None,1.375,"2025-08-18",42,"pkg4",[],"Διατήρηση 2ο έτος. Έρχεται ανά 6 εβδομάδες.","active"),
 ("Σπύρος Λεονταρίδης","Α","1991-08-17",185,94.2,"Απώλεια βάρους",85,1.2,"2025-08-04",21,"pkg8",[],"Διέκοψε τον Απρίλιο λόγω μετακόμισης στη Λάρισα. Ίσως συνεχίσει online.","inactive"),
 ("Αγγελική Βλάχου","Γ","1983-12-01",164,81.0,"Απώλεια βάρους",68,1.375,"2025-09-22",14,"pkg8",[],"Έφτασε στόχο 69 kg τον Μάιο. Ολοκλήρωσε το πρόγραμμα.","inactive"),
 ("Στέλλα Μιχαηλίδου","Γ","1970-03-19",162,77.3,"Παθολογική διατροφή",70,1.2,"2025-10-20",21,"pkg4",["Χοληστερίνη"],"Διέκοψε τον Φεβρουάριο για οικονομικούς λόγους.","inactive"),
 ("Ζωή Καλογεράκη","Γ","1996-06-06",170,73.8,"Απώλεια βάρους",65,1.55,"2025-11-10",14,"pkg4",[],"Σταμάτησε τον Ιούνιο — μετάθεση στην Κρήτη.","inactive"),
]
INACTIVE_END = {"Σπύρος Λεονταρίδης":D(2026,4,8),"Αγγελική Βλάχου":D(2026,5,20),"Στέλλα Μιχαηλίδου":D(2026,2,11),"Ζωή Καλογεράκη":D(2026,6,17)}

PKG = {"pkg8":("Πακέτο 8 συνεδριών",8,300),"pkg4":("Πακέτο 4 συνεδριών",4,160),"online":("Online μηνιαίο (4 συνεδρίες)",4,100)}
SINGLE, FIRST = 45, 65
METHODS = [("Κάρτα",45),("Μετρητά",25),("IRIS",20),("Τραπεζική κατάθεση",10)]
def method():
    r = random.uniform(0,100); acc = 0
    for m,w in METHODS:
        acc += w
        if r <= acc: return m
    return "Κάρτα"

# office hours — split shift (Greek style)
WEEK_SLOTS = ["09:00","09:45","10:30","11:15","12:00","12:45","13:30","17:00","17:45","18:30","19:15","20:00"]
SAT_SLOTS = ["10:00","10:45","11:30","12:15","13:00"]
busy = set()
def slot_for(day, pref):
    slots = SAT_SLOTS if day.weekday()==5 else WEEK_SLOTS
    if day.weekday()==6: return None
    order = sorted(slots, key=lambda s: abs(int(s[:2])*60+int(s[3:]) - pref))
    for s in order:
        if (day, s) not in busy:
            busy.add((day, s)); return s
    return None
def schedule(day, pref):
    for shift in [0,1,-1,2,3,-2,4]:
        d = day + datetime.timedelta(days=shift)
        if d.weekday()==6: continue
        s = slot_for(d, pref)
        if s: return d, s
    return None, None

docs = {k:{} for k in ["clients","measurements","appointments","packages","payments","plans","settings"]}
cnt = {"m":0,"a":0,"k":0,"p":0}
def nid(prefix):
    cnt[prefix]+=1; return "%s%02d" % (prefix, cnt[prefix])

for idx, (name,sex,bd,h,w0,goal,tw,act,start,freq,billing,tags,notes,status) in enumerate(C, start=1):
    cid = "c%d" % idx
    start_d = D.fromisoformat(start)
    docs["clients"][cid] = {"name":name,"sex":sex,"birthdate":bd,"height":h,"targetWeight":tw,"goal":goal,"activity":act,
        "startDate":start,"status":status,"tags":tags,"notes":notes,
        "phone":"69%d %03d %03d" % (random.randint(30,99), random.randint(100,999), random.randint(100,999)),
        "email":"", "demo":True}
    # email
    tr = {"α":"a","ά":"a","β":"v","γ":"g","δ":"d","ε":"e","έ":"e","ζ":"z","η":"i","ή":"i","θ":"th","ι":"i","ί":"i","ϊ":"i","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"x","ο":"o","ό":"o","π":"p","ρ":"r","σ":"s","ς":"s","τ":"t","υ":"y","ύ":"y","φ":"f","χ":"ch","ψ":"ps","ω":"o","ώ":"o"}
    first, last = name.lower().split()[0], name.lower().split()[-1]
    lat = lambda s: "".join(tr.get(ch, ch) for ch in s)
    docs["clients"][cid]["email"] = "%s.%s@%s" % (lat(first), lat(last)[:9], random.choice(["gmail.com","gmail.com","yahoo.gr","hotmail.com","outlook.com"]))

    # visits
    end = INACTIVE_END.get(name, WIN_END)
    freq = {14:7, 21:10, 28:21}.get(freq, freq)
    pref = random.choice([570, 630, 690, 750, 1050, 1110, 1170, 1200])
    visits = []
    d = start_d
    k = 0
    while d <= end:
        vd, vt = schedule(d, pref)
        if vd and vd <= end:
            visits.append((vd, vt, k))
        k += 1
        d = d + datetime.timedelta(days=freq + random.choice([-2,-1,0,0,0,1,2,3]))
    # statuses
    vlist = []
    for (vd, vt, k) in visits:
        if vd > TODAY or (vd == TODAY and int(vt[:2]) >= 9 and vt >= "09:30"):
            st = "scheduled"
        else:
            r = random.random()
            st = "done" if r < 0.9 else ("cancelled" if r < 0.96 else "noshow")
            if k == 0: st = "done"
        if billing == "online": typ, dur = ("Πρώτη επίσκεψη",60) if k==0 else ("Online συνεδρία",30)
        elif k == 0: typ, dur = "Πρώτη επίσκεψη", 60
        elif k % 3 == 0: typ, dur = "Μέτρηση σύστασης", 30
        else: typ, dur = "Επανέλεγχος", 45
        vlist.append({"date":vd,"time":vt,"k":k,"status":st,"type":typ,"duration":dur})

    # packages & charges
    pkgs = []
    cur = None
    for v in vlist:
        consumes = v["status"] in ("done","noshow")
        if billing == "single":
            v["pkg"] = None
            v["fee"] = FIRST if v["k"]==0 else SINGLE
            continue
        v["fee"] = None
        if v["status"] == "cancelled":
            v["pkg"] = None; continue
        if cur is None or cur["used_all"] >= cur["sessions"]:
            if v["status"] == "scheduled" and cur is not None:
                v["pkg"] = None; v["fee"] = SINGLE; continue
            nm, ses, price = PKG[billing]
            cur = {"id":nid("k"),"name":nm,"sessions":ses,"price":price,"start":v["date"],"used_all":0,"hist":0}
            pkgs.append(cur)
        v["pkg"] = cur["id"]
        if consumes:
            cur["used_all"] += 1
            if v["date"] < WIN_START: cur["hist"] += 1
        elif v["status"] == "scheduled":
            if cur["used_all"] + sum(1 for x in vlist if x.get("pkg")==cur["id"] and x["status"]=="scheduled" and x is not v) >= cur["sessions"]:
                v["pkg"] = None; v["fee"] = SINGLE

    for p in pkgs:
        docs["packages"][p["id"]] = {"clientId":cid,"name":p["name"],"sessions":p["sessions"],"price":p["price"],
            "startDate":iso(p["start"]),"usedOffset":p["hist"],"demo":True}
        # payments
        r = random.random()
        recent = (TODAY - p["start"]).days < 45
        if r < 0.62 or not recent and r < 0.85:
            docs["payments"][nid("p")] = {"clientId":cid,"date":iso(p["start"]),"amount":p["price"],"method":method(),"note":p["name"],"packageId":p["id"],"demo":True}
        elif r < 0.93 or not recent:
            half = p["price"]//2
            docs["payments"][nid("p")] = {"clientId":cid,"date":iso(p["start"]),"amount":half,"method":method(),"note":p["name"]+" — 1η δόση","packageId":p["id"],"demo":True}
            d2 = p["start"] + datetime.timedelta(days=random.randint(21,35))
            if d2 <= TODAY:
                docs["payments"][nid("p")] = {"clientId":cid,"date":iso(d2),"amount":p["price"]-half,"method":method(),"note":p["name"]+" — 2η δόση","packageId":p["id"],"demo":True}
        else:
            part = random.choice([0, p["price"]//2])
            if part:
                docs["payments"][nid("p")] = {"clientId":cid,"date":iso(p["start"]),"amount":part,"method":method(),"note":p["name"]+" — προκαταβολή","packageId":p["id"],"demo":True}

    # appointments in window + single fee payments
    for v in vlist:
        if v["date"] < WIN_START: continue
        aid = nid("a")
        docs["appointments"][aid] = {"clientId":cid,"date":iso(v["date"]),"time":v["time"],"type":v["type"],"duration":v["duration"],
            "status":v["status"],"packageId":v.get("pkg"),"fee":v.get("fee"),"notes":"","demo":True}
        if v.get("fee") and v["status"] == "done" and random.random() < 0.86:
            docs["payments"][nid("p")] = {"clientId":cid,"date":iso(v["date"]),"amount":v["fee"],"method":method(),"note":"Συνεδρία "+v["type"].lower(),"packageId":None,"demo":True}
        # single-fee history (none — single clients all start inside the window)

    # measurements: about every 4 weeks on done visits (+ always the first)
    last_m = None
    done_v = [v for v in vlist if v["status"]=="done"]
    n_total = len(done_v)
    weeks_total = max(1, ((done_v[-1]["date"] - start_d).days/7) if done_v else 1)
    for v in done_v:
        if last_m is not None and (v["date"] - last_m).days < 33:
            continue
        last_m = v["date"]
        t = (v["date"] - start_d).days / 7.0
        if goal == "Απώλεια βάρους":
            rate = 0.55 if sex=="Α" else 0.45
            loss = rate * 22 * (1 - math.exp(-t/22))   # slowing curve
            w = w0 - loss
            if tw: w = max(w, tw + 0.4)
        elif goal == "Παθολογική διατροφή":
            w = w0 - 0.25 * 30 * (1 - math.exp(-t/30))
        elif goal == "Αύξηση μυϊκής μάζας":
            w = w0 + 0.18 * t
            if tw: w = min(w, tw)
        elif goal == "Εγκυμοσύνη":
            w = w0 + 0.42 * t
        else:
            w = w0 + math.sin(t/3.0) * 0.6
        w = round(w + random.uniform(-0.35, 0.35), 1)
        prog = (w0 - w)
        if sex == "Γ":
            bf0 = 24 + (w0/((h/100)**2) - 21) * 1.25
        else:
            bf0 = 14 + (w0/((h/100)**2) - 22) * 1.3
        if goal in ("Αθλητική διατροφή",): bf0 -= 5
        bf = round(max(9 if sex=="Α" else 16, bf0 - prog*0.72 - (0.15*t if goal=="Αύξηση μυϊκής μάζας" else 0) + random.uniform(-0.4,0.4)), 1)
        muscle = round(w * (1 - bf/100) * (0.54 if sex=="Α" else 0.51) + random.uniform(-0.2, 0.2), 1)
        water = round((1 - bf/100) * 73 * 0.99 + random.uniform(-0.8, 0.8), 1)
        visceral = max(1, round((bf - (10 if sex=="Α" else 18)) * (0.62 if sex=="Α" else 0.35) + (age:=(TODAY.year-int(bd[:4])))/14 + random.uniform(-0.4,0.4)))
        waist = round((w * (0.96 if sex=="Α" else 0.93)) + (h-170)*-0.1 + random.uniform(-1.5,1.5))
        hip = round(waist * (1.03 if sex=="Α" else 1.2) + random.uniform(-1,1))
        mid = nid("m")
        docs["measurements"][mid] = {"clientId":cid,"date":iso(v["date"]),"weight":w,"bodyFat":bf,"muscle":muscle,"water":water,
            "visceral":visceral,"waist":waist,"hip":hip,"notes":"Αρχική αξιολόγηση" if v["k"]==0 else "","demo":True}

# extra bookings today
extra = [("c19","Επανέλεγχος",45,"single"),("c24","Επανέλεγχος",45,"single"),("c13","Μέτρηση σύστασης",30,"pkg")]
for cid, typ, dur, bill in extra:
    for s_ in ["10:30","12:00","17:45","18:30","19:15","11:15","12:45"]:
        if (TODAY, s_) not in busy:
            busy.add((TODAY, s_))
            pk = None; fee = SINGLE
            if bill=="pkg":
                ps = [k for k,p in docs["packages"].items() if p["clientId"]==cid]
                pk = ps[-1] if ps else None; fee = None if pk else SINGLE
            docs["appointments"][nid("a")] = {"clientId":cid,"date":iso(TODAY),"time":s_,"type":typ,"duration":dur,"status":"scheduled","packageId":pk,"fee":fee,"notes":"","demo":True}
            break

# ---------- plans ----------
def item(food, qty):
    f = FOOD[food]; k = qty / f[2]
    return {"food":food,"qty":qty,"unit":f[3],"per":f[2],"base":[f[4],f[5],f[6],f[7]],
            "kcal":round(f[4]*k),"p":round(f[5]*k,1),"c":round(f[6]*k,1),"f":round(f[7]*k,1)}
def meal(name, *items): return {"name":name,"items":[item(a,b) for a,b in items]}
def tot(meals): return sum(i["kcal"] for m in meals for i in m["items"])

PL = [
 ("c1","Φάση 2 — σταθερή απώλεια","2026-09-10",[
   meal("Πρωινό",("Γιαούρτι στραγγιστό 0%",200),("Βρώμη νιφάδες",35),("Φράουλες",150)),
   meal("Δεκατιανό",("Μήλο",1),("Αμύγδαλα",15)),
   meal("Μεσημεριανό",("Κοτόπουλο στήθος ψητό",140),("Ρύζι basmati μαγειρεμένο",130),("Σαλάτα εποχής",200),("Ελαιόλαδο",1)),
   meal("Απογευματινό",("Ρυζογκοφρέτα",2),("Ανθότυρο light",40)),
   meal("Βραδινό",("Τσιπούρα ψητή",200),("Μπρόκολο βραστό",200),("Ελαιόλαδο (κουταλάκι)",2))],
   "Νερό 2 L/ημέρα. Γιαούρτι lactose free. Ελεύθερο γεύμα Σάββατο βράδυ — όχι αλκοόλ πέρα από 1 ποτήρι κρασί.",False),
 ("c2","Όγκος — 3.000 kcal","2026-09-01",[
   meal("Πρωινό",("Αυγό",3),("Ψωμί ολικής άλεσης",2),("Αβοκάντο",60)),
   meal("Δεκατιανό",("Πρωτεΐνη ορού γάλακτος",35),("Μπανάνα",1),("Φυστικοβούτυρο χωρίς ζάχαρη",1)),
   meal("Μεσημεριανό",("Μοσχάρι άπαχο ψητό",180),("Μακαρόνια ολικής βραστά",250),("Σαλάτα εποχής",150),("Ελαιόλαδο",1)),
   meal("Απογευματινό",("Γιαούρτι στραγγιστό 2%",250),("Μέλι",2),("Καρύδια",30),("Βρώμη νιφάδες",40)),
   meal("Βραδινό",("Σολομός ψητός",170),("Γλυκοπατάτα ψητή",300),("Σπανάκι",150))],
   "Shake αμέσως μετά την προπόνηση. Κρεατίνη 5 g με το πρωινό.",False),
 ("c4","Προετοιμασία ημιμαραθωνίου","2026-09-12",[
   meal("Πρωινό",("Βρώμη νιφάδες",60),("Γάλα 1.5%",250),("Μπανάνα",1),("Μέλι",1)),
   meal("Δεκατιανό",("Παξιμάδι κρίθινο",40),("Τυρί φέτα",30),("Ντομάτα",150)),
   meal("Μεσημεριανό",("Φακές μαγειρεμένες",300),("Τυρί φέτα",30),("Σαλάτα εποχής",200),("Ελαιόλαδο",1)),
   meal("Απογευματινό",("Πορτοκάλι",1),("Αμύγδαλα",20)),
   meal("Βραδινό",("Γαλοπούλα φιλέτο",160),("Κινόα μαγειρεμένη",150),("Κολοκυθάκια βραστά",200),("Ελαιόλαδο",1))],
   "Μέρα long run: +40 g βρώμη στο πρωινό και 1 χουρμά ανά 45′ τρεξίματος.",False),
 ("c10","Διαβήτης τ.2 — χαμηλός ΓΔ","2026-09-14",[
   meal("Πρωινό",("Ψωμί σίκαλης",2),("Αυγό",2),("Ντομάτα",150)),
   meal("Δεκατιανό",("Γιαούρτι στραγγιστό 2%",170),("Καρύδια",15)),
   meal("Μεσημεριανό",("Φασόλια μαγειρεμένα",250),("Χόρτα βραστά",250),("Ελαιόλαδο",1),("Σαρδέλα ψητή",100)),
   meal("Απογευματινό",("Μήλο",1),("Τυρί cottage",100)),
   meal("Βραδινό",("Κοτόπουλο στήθος ψητό",170),("Φασολάκια βραστά",250),("Ελαιόλαδο (κουταλάκι)",2))],
   "Μέτρηση σακχάρου 2 ώρες μετά το μεσημεριανό, δύο φορές την εβδομάδα. Όχι χυμοί φρούτων.",False),
 ("c7","Χορτοφαγικό — απώλεια","2026-09-09",[
   meal("Πρωινό",("Κεφίρ",250),("Μούσλι χωρίς ζάχαρη",40),("Μύρτιλα",100)),
   meal("Δεκατιανό",("Αχλάδι",1)),
   meal("Μεσημεριανό",("Ρεβίθια μαγειρεμένα",200),("Σπανάκι",150),("Ελαιόλαδο",1),("Ψωμί ολικής άλεσης",1)),
   meal("Απογευματινό",("Αυγό",2),("Αγγούρι",150)),
   meal("Βραδινό",("Τόφου",180),("Ρύζι καστανό μαγειρεμένο",120),("Μανιτάρια",150),("Ελαιόλαδο (κουταλάκι)",2))],
   "Βιταμίνη C (πιπεριά, λεμόνι) μαζί με τα όσπρια για καλύτερη απορρόφηση σιδήρου.",False),
 ("c8","ΣΠΚΩ — χαμηλό γλυκαιμικό φορτίο","2026-09-17",[
   meal("Πρωινό",("Γιαούρτι στραγγιστό 2%",200),("Σπόροι chia",1),("Φράουλες",150)),
   meal("Δεκατιανό",("Αμύγδαλα",20)),
   meal("Μεσημεριανό",("Σολομός ψητός",150),("Κινόα μαγειρεμένη",100),("Σαλάτα εποχής",200),("Ελαιόλαδο",1)),
   meal("Απογευματινό",("Ψωμί σίκαλης",1),("Γαλοπούλα καπνιστή",40)),
   meal("Βραδινό",("Χοιρινό ψαρονέφρι",150),("Μελιτζάνα ψητή",200),("Ελαιόλαδο (κουταλάκι)",2))],
   "Συνδυασμός υδατάνθρακα με πρωτεΐνη σε κάθε γεύμα. Περπάτημα 15′ μετά το μεσημεριανό.",False),
 ("","Μεσογειακό 1.600 kcal","2026-05-01",[
   meal("Πρωινό",("Ψωμί ολικής άλεσης",2),("Τυρί φέτα",30),("Ντομάτα",150),("Ελιές Καλαμών",5)),
   meal("Δεκατιανό",("Γιαούρτι στραγγιστό 2%",170),("Μέλι",1)),
   meal("Μεσημεριανό",("Φασολάκια λαδερά",1),("Τυρί φέτα",30),("Ψωμί ολικής άλεσης",1)),
   meal("Απογευματινό",("Πορτοκάλι",1),("Καρύδια",15)),
   meal("Βραδινό",("Λαβράκι ψητό",200),("Χόρτα βραστά",250),("Ελαιόλαδο",1))],
   "Βάση για ενήλικες με στόχο σταδιακή απώλεια. Προσαρμόστε τις μερίδες υδατανθράκων.",True),
 ("","Αθλητικό 2.400 kcal — ημέρα προπόνησης","2026-05-01",[
   meal("Πρωινό",("Βρώμη νιφάδες",70),("Γάλα 1.5%",300),("Μπανάνα",1),("Φυστικοβούτυρο χωρίς ζάχαρη",1)),
   meal("Δεκατιανό",("Αραβική πίτα ολικής",1),("Γαλοπούλα καπνιστή",60),("Κασέρι light",30)),
   meal("Μεσημεριανό",("Κοτόπουλο στήθος ψητό",170),("Ρύζι basmati μαγειρεμένο",220),("Σαλάτα εποχής",200),("Ελαιόλαδο",1)),
   meal("Απογευματινό",("Πρωτεΐνη ορού γάλακτος",30),("Χουρμάδες",3)),
   meal("Βραδινό",("Σολομός ψητός",150),("Πατάτα βραστή",250),("Μπρόκολο βραστό",200))],
   "Υδατάνθρακες γύρω από την προπόνηση. Ενυδάτωση 35 ml/kg + απώλειες ιδρώτα.",True),
 ("","Χορτοφαγικό 1.800 kcal","2026-05-01",[
   meal("Πρωινό",("Κεφίρ",250),("Βρώμη νιφάδες",40),("Μήλο",1),("Κανέλα" if False else "Σπόροι chia",1)),
   meal("Δεκατιανό",("Αμύγδαλα",25)),
   meal("Μεσημεριανό",("Γίγαντες μαγειρεμένοι",250),("Σαλάτα εποχής",200),("Ελαιόλαδο",1),("Ψωμί ολικής άλεσης",1)),
   meal("Απογευματινό",("Αυγό",2),("Ντομάτα",150)),
   meal("Βραδινό",("Τόφου",150),("Κινόα μαγειρεμένη",150),("Σπανάκι",150),("Ταχίνι",1))],
   "Έλεγχος B12 και φερριτίνης κάθε 6 μήνες.",True),
]
for i,(cid,title,date,meals,notes,tpl) in enumerate(PL, start=1):
    t = tot(meals)
    target = int(round((t + random.choice([-40,-20,0,20,30])) / 50.0) * 50)
    docs["plans"]["pl%d"%i] = {"clientId":cid,"title":title,"date":date,"targetKcal":target,"meals":meals,"notes":notes,"isTemplate":tpl,"demo":True}

docs["settings"]["main"] = {"practiceName":"Γραφείο Διατροφής","sessionPrice":SINGLE,"firstVisitPrice":FIRST,
  "presets":[{"name":n,"sessions":s,"price":p} for (n,s,p) in PKG.values()]}

manifest = []
for col, items in docs.items():
    for did, body in items.items():
        p = os.path.join(OUT, "%s_%s.json" % (col[:2], did))
        json.dump(body, open(p,"w",encoding="utf-8"), ensure_ascii=False, separators=(",",":"))
        manifest.append((col, did, p))
json.dump(manifest, open("./manifest.json","w"))
json.dump(docs, open("./all.json","w",encoding="utf-8"), ensure_ascii=False)

# ---- stats ----
print({k:len(v) for k,v in docs.items()}, "total", len(manifest))
from collections import Counter
rev = Counter()
for p in docs["payments"].values(): rev[p["date"][:7]] += p["amount"]
print(sorted(rev.items())[-13:])
wk = Counter(a["date"] for a in docs["appointments"].values() if a["status"]!="cancelled")
print("today", wk[iso(TODAY)], "week", sum(v for k,v in wk.items() if iso(TODAY - datetime.timedelta(days=3)) <= k <= iso(TODAY+datetime.timedelta(days=2))))
