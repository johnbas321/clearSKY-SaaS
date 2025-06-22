# MICROSERVICE

## Statistics Microservice

Node.js microservice για υπολογισμό και προσωρινή αποθήκευση στατιστικών βαθμολογίας στην πλατφόρμα clearSKY.

### Χαρακτηριστικά

* **Συλλογή Στατιστικών**: Ανάκτηση κατανομών βαθμολογιών ανά ερώτηση/τελικό βαθμό από grading microservice
* **Αποθήκευση JSON**: Αποθήκευση κατανομής ως JSON σε MySQL
* **Διάκριση FINAL/OPEN**: Διαχωρισμός στατιστικών για τελική και αρχική βαθμολόγηση
* **Εξοικονόμηση Πόρων**: Αποφυγή επαναλαμβανόμενης ανάκτησης από grading service
* **Εσωτερική Επικοινωνία**: Χρήση internal token για ασφάλεια μεταξύ microservices

### Stat Model

```sql
stats(
  course_id: INT,
  time_period: VARCHAR,
  distribution: JSON,
  is_final: BOOLEAN,
  PRIMARY KEY (course_id, time_period)
)
```

### API Endpoints

#### Εσωτερική Πρόσβαση μέσω Orchestrator

* `GET /stats?course_id=123&time_period=2024-2025 ΧΕΙΜ 2024&grade_state=FINAL`
  ➤ Αν δεν υπάρχει τοπικά, ανακτά και αποθηκεύει από grading microservice.

### Παράδειγμα Δομής `distribution`

```json
{
  "total": {
    "10": 4,
    "9": 6,
    ...
  },
  "Q01": {
    "0": 1,
    "1": 3,
    "2": 6,
    ...
  },
  "Q02": { ... },
  ...
}
```

### Επικοινωνία με Grading Service

* Εσωτερικό `GET` σε:
  `http://grading:3002/grades/internal/grades/stats`
* Query params:

```json
{
  "course_id": 123,
  "time_period": "2024-2025 ΧΕΙΜ 2024",
  "is_final": true
}
```

* Headers:

```http
x-internal-token: prod123#
```

### Ανταποκρίσεις Σφαλμάτων

```json
{
  "success": false,
  "message": "Περιγραφή Σφάλματος"
}
```

### Status Codes:

* `400` – Ελλιπή ή άκυρα δεδομένα
* `401` – Δεν υπάρχει συνεδρία
* `403` – Εσωτερικό token λανθασμένο
* `404` – Καμία κατανομή
* `500` – Εσωτερικό σφάλμα ή grading fetch failure

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
docker build -t stats-service .
docker run -p 3004:3004 --name stats --network clearsky stats-service
```

### Δομή Έργου

```
stats-service/
├── src/
│   ├── controllers/         # Χειριστές API
│   ├── models/              # Stat entity
│   ├── routes/              # Endpoint definitions
│   ├── services/            # Fetch from grading
│   ├── utils/               # DB/Redis helpers
│   ├── middlewares/         # validateToken / internalAuth
│   ├── config.js            # DB/App config
│   └── app.js               # Entry point
├── db_init.sql
├── Dockerfile
├── package.json
└── README.md
```

### Ασφάλεια

* Όλα τα endpoints προστατεύονται με session validation (`validateToken`)
* Όλες οι εξωτερικές κλήσεις προστατεύονται με `x-internal-token`
* Οι απαντήσεις από grading επαληθεύονται πριν αποθήκευση

### Παρατηρήσεις

* Η υπηρεσία **δεν υπολογίζει** στατιστικά, αλλά τα **προωθεί και αποθηκεύει**
* Αποθηκεύει κατανομή με key `total` για συνολικές και `QXX` για ανά ερώτηση
* Αν δεν υπάρχουν τοπικά αποθηκευμένα στατιστικά, γίνεται `fetch` από grading microservice
