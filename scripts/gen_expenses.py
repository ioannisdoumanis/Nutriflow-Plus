import json, os, random, datetime, shutil
random.seed(5)
D=datetime.date; TODAY=D(2026,9,24)
OUT='./sx'; shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
docs={}; n=[0]
def add(d, amt, cat, vendor, method, rec=False, note=''):
    if d > TODAY: return
    n[0]+=1; docs['e%03d'%n[0]]={'date':d.isoformat(),'amount':round(amt,2),'category':cat,'vendor':vendor,'method':method,'recurring':rec,'note':note,'demo':True}
months=[]
y,m=2025,8
while (y,m)<=(2026,9):
    months.append((y,m)); m+=1
    if m==13: y,m=y+1,1
for (y,m) in months:
    first=D(y,m,1)
    add(D(y,m,1), 420, 'Ενοίκιο', 'Ενοίκιο γραφείου — Πατησίων 112', 'Τραπεζική κατάθεση', True)
    heat = m in (11,12,1,2,3)
    add(D(y,m,5), 55 if heat else 28, 'Κοινόχρηστα', 'Κοινόχρηστα πολυκατοικίας', 'Μετρητά', True)
    add(D(y,m,3), 6.8, 'Λογισμικό & συνδρομές', 'Google Workspace', 'Κάρτα', True)
    if (y,m)>=(2026,1): add(D(y,m,3), 11.99, 'Λογισμικό & συνδρομές', 'Canva Pro', 'Κάρτα', True)
    add(D(y,m,10), 90, 'Λογιστής', 'Λογιστικό γραφείο Μαρκόπουλος', 'Τραπεζική κατάθεση', True)
    add(D(y,m,12), 38.9, 'Τηλέφωνο & internet', 'Cosmote — σταθερό & internet', 'Πάγια εντολή', True)
    power = 45 + (40 if m in (12,1,2) else 0) + (50 if m in (7,8) else 0) + random.uniform(-6,8)
    add(D(y,m,18), power, 'Ρεύμα', 'ΔΕΗ', 'Πάγια εντολή', True)
    import calendar
    last=calendar.monthrange(y,m)[1]
    add(D(y,m,last), 238.2, 'ΕΦΚΑ / εισφορές', 'ΕΦΚΑ — μηνιαίες εισφορές', 'Τραπεζική κατάθεση', True)
    if m in (2,6,10): add(D(y,m,22), random.choice([21.4,24.8,19.6]), 'Νερό', 'ΕΥΔΑΠ', 'Κάρτα')
    if m in (9,10,1,3,5,9) and (y,m)!=(2025,8): add(D(y,m,8), random.choice([60,80,120,150]), 'Μάρκετινγκ', 'Meta Ads — Instagram/Facebook', 'Κάρτα')
    if m in (8,11,2,5,7): add(D(y,m,15), random.choice([27.5,34.9,42.3]), 'Αναλώσιμα', 'Χαρτί εκτυπωτή, μελάνια, μεζούρες', 'Κάρτα')
    if random.random()<.45: add(D(y,m,random.randint(6,26)), random.choice([18,24,32,40]), 'Μετακινήσεις', 'Καύσιμα / στάθμευση', 'Κάρτα')
# one-offs
add(D(2025,8,20), 1450, 'Εξοπλισμός', 'Ζυγαριά λιπομέτρησης Tanita', 'Κάρτα', note='αγορά εξοπλισμού — έναρξη γραφείου')
add(D(2025,8,22), 65, 'Εξοπλισμός', 'Δερματοπτυχόμετρο & μεζούρες', 'Κάρτα')
add(D(2025,9,4), 340, 'Εξοπλισμός', 'Γραφείο, καρέκλες, ντουλάπι αρχείου', 'Κάρτα')
add(D(2026,1,15), 180, 'Ασφάλιση', 'Ασφάλιση επαγγελματικής ευθύνης', 'Κάρτα', note='ετήσια')
add(D(2026,3,21), 220, 'Εκπαίδευση', 'Σεμινάριο κλινικής διατροφής', 'Κάρτα')
add(D(2026,5,16), 150, 'Εκπαίδευση', 'Πανελλήνιο συνέδριο διαιτολόγων', 'Κάρτα')
add(D(2025,10,2), 95, 'Μάρκετινγκ', 'Κάρτες & φυλλάδια — τυπογραφείο', 'Μετρητά')
add(D(2026,4,9), 129, 'Άλλο', 'Επισκευή κλιματιστικού', 'Μετρητά')
man=[]
for k,v in docs.items():
    p=os.path.join(OUT,k+'.json'); json.dump(v,open(p,'w',encoding='utf-8'),ensure_ascii=False); man.append(k)
json.dump(docs, open('./expenses.json','w',encoding='utf-8'), ensure_ascii=False)
from collections import Counter
c=Counter()
for v in docs.values(): c[v['date'][:7]]+=v['amount']
print(len(docs)); print(sorted((k,round(v)) for k,v in c.items()))
