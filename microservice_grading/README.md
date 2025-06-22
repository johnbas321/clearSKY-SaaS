# MICROSERVICE

## Course/Grading Microservice

Node.js microservice για τη διαχείριση βαθμολογιών και μαθημάτων στην πλατφόρμα clearSKY.

### Χαρακτηριστικά

* **Διαχείριση Μαθημάτων**: Δημιουργία και διαγραφή μαθημάτων από εκπαιδευτές
* **Αρχική & Τελική Βαθμολόγηση**: Μεταφόρτωση Excel με επιμέρους βαθμούς και τελική επιβεβαίωση
* **Εισαγωγή μέσω Excel**: Ανάγνωση και ανάλυση φύλλων Excel για βαθμολογίες ανά ερώτηση
* **Κατάσταση Μαθήματος**: Χειρισμός VOID → OPEN → FINAL για κάθε περίοδο βαθμολογίας
* **Προσωπικά Μαθήματα**: Προβολή μαθημάτων και βαθμολογιών για κάθε φοιτητή
* **Στατιστικά Βαθμολογιών**: Εσωτερικά endpoints για aggregation βαθμών ανά ερώτηση

### Course Model

```sql
courses(
  id: INT,
  course_name: VARCHAR,
  instructor_id: INT,
  time_period: VARCHAR,
  grade_state: ENUM('VOID','OPEN','FINAL'),
  initial_grades_at: DATE,
  final_grades_at: DATE,
  PRIMARY KEY(id, time_period)
)
```

### Grade Model

```sql
grades(
  course_id: INT,
  time_period: VARCHAR,
  student_id: INT,
  grade: INT,
  total_questions: INT,
  grades_per_question: JSON,
  is_final: BOOLEAN,
  PRIMARY KEY(course_id, time_period, student_id)
)
```

### API Endpoints

#### Δημόσια / Εκπαιδευτή

* `POST /grades/upload` - Μεταφόρτωση Excel βαθμών (Multipart)
* `POST /grades/upload/inital/confirm` - Επιβεβαίωση αρχικής εισαγωγής
* `POST /grades/upload/final/confirm` - Επιβεβαίωση τελικής βαθμολόγησης
* `POST /grades/courses/create` - Δημιουργία νέου μαθήματος
* `POST /grades/courses/delete` - Διαγραφή μαθήματος (μόνο VOID)
* `GET /grades/courses` - Προβολή όλων των μαθημάτων

#### Δημόσια / Φοιτητή

* `GET /grades/self/courses` - Μαθήματα που ανήκει ο φοιτητής
* `GET /grades/self/grades` - Βαθμολογία ανά μάθημα & περίοδο

#### Εσωτερικά

* `GET /grades/internal/grades/stats` - Aggregated βαθμολογίες ανά ερώτηση & τελικό βαθμό

#### Υγεία

* `GET /grades/healthcheck` - Έλεγχος λειτουργίας

### Παραδείγματα Excel Δομής

* Πρώτη Γραμμή: `ΒΑΘΜΟΛΟΓΙΟ <Course Name> (<Course ID>) <Period>`
* Τρίτη Γραμμή και κάτω:

```json
{
  "Αριθμός Μητρώου": 123456,
  "Βαθμολογία": 8,
  "Περίοδος δήλωσης": "2024-2025 ΧΕΙΜ 2024",
  "Q01": 1,
  "Q02": 1,
  "Q03": 2,
  ...
}
```

### Κατάσταση Μαθήματος (State Transitions)

* `VOID`: Καμία βαθμολόγηση — επιτρέπεται διαγραφή & αρχική μεταφόρτωση
* `OPEN`: Έχει αρχικές βαθμολογίες — επιτρέπεται τελική βαθμολόγηση
* `FINAL`: Τελική υποβολή — καμία αλλαγή επιτρεπτή

### Ανταποκρίσεις Σφαλμάτων

```json
{
  "success": false,
  "message": "Περιγραφή Σφάλματος"
}
```

Συχνά status codes:

* `400`: Λανθασμένα δεδομένα
* `403`: Ανεπαρκή δικαιώματα (π.χ. μη εκπαιδευτής)
* `404`: Πόρος δεν βρέθηκε
* `410`: Έληξε συνεδρία μεταφόρτωσης
* `500`: Εσωτερικό σφάλμα

### Ανάπτυξη

#### Προαπαιτούμενα

* Node.js 18+
* MySQL 8.0+
* Redis
* Docker (προαιρετικά)

#### Τοπική Εκκίνηση

```bash
npm install
node src/app.js
```

#### Docker

```bash
docker build -t grading-service .
docker run -p 3002:3002 --name grading --network clearsky grading-service
```

### Δομή Έργου

```
grading-service/
├── src/
│   ├── controllers/          # Χειριστές αιτήσεων
│   ├── models/               # Course & Grade entities
│   ├── routes/               # Ορισμοί endpoints
│   ├── services/             # Join/aggregate queries
│   ├── utils/                # Redis/DB helpers
│   ├── middlewares/          # Error & token auth
│   ├── config.js             # Config μεταβλητές
│   └── app.js                # Entry point
├── db_init.sql               # SQL για schema
├── Dockerfile
├── package.json
└── README.md
```

### Ασφάλεια & Έλεγχοι

* Όλες οι λειτουργίες φιλτραρισμένες ανά ρόλο
* Τα δεδομένα Excel επικυρώνονται για συνέπεια και ταυτοποίηση
* Τα προσωρινά δεδομένα αποθηκεύονται σε cache (node-cache)
* Όλα τα queries χρησιμοποιούν prepared statements για προστασία από SQL injection

### Παρατηρήσεις

* Υποστηρίζει πολλαπλές περιόδους για ίδιο μάθημα (composite key: id + period)
* Όλες οι ενέργειες στο grading καταγράφονται σε real time
* Κατάλληλο για RESTful ενοποίηση με άλλες υπηρεσίες clearSKY
