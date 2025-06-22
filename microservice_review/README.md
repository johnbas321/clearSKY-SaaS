# MICROSERVICE

## Review Microservice

Node.js microservice για διαχείριση αιτημάτων επανεξέτασης βαθμολογιών στην πλατφόρμα clearSKY.

### Χαρακτηριστικά

* **Αιτήματα Επανεξέτασης**: Δημιουργία αιτημάτων από φοιτητές ανά μάθημα και περίοδο
* **Απαντήσεις Καθηγητών**: Καταγραφή επίσημων απαντήσεων και κλείσιμο αιτήματος
* **Κατάσταση Αιτήματος**: OPEN → CLOSED, ένα ενεργό αίτημα ανά φοιτητή/μάθημα/περίοδο
* **Προβολή Κατάστασης**: Φοιτητής βλέπει την κατάσταση του αιτήματος του
* **Φιλτράρισμα Καθηγητή**: Προβολή όλων των αιτημάτων ανά καθηγητή
* **Καθορισμός Ενεργειών**: Επιστροφή `can_request`, `can_view` ανάλογα με το grade state

### Request Model

```sql
requests(
  request_id: INT (AUTO_INCREMENT),
  course_name: VARCHAR,
  time_period: VARCHAR,
  student_id: INT,
  student_name: VARCHAR,
  instructor_id: INT,
  request_message: TEXT,
  request_state: ENUM('OPEN','CLOSED') DEFAULT 'OPEN',
  PRIMARY KEY: request_id,
  UNIQUE: (course_name, time_period, student_id)
)
```

### Reply Model

```sql
replies(
  request_id: INT,
  student_name: VARCHAR,
  reply_message: TEXT,
  PRIMARY KEY: request_id,
  FOREIGN KEY: request_id → requests(request_id)
)
```

### API Endpoints

#### Δημόσια / Φοιτητής

* `POST /reviews/new/review` - Δημιουργία αιτήματος επανεξέτασης
* `GET /reviews/status/:request_id` - Προβολή κατάστασης αιτήματος (και απάντησης αν υπάρχει)
* `GET /reviews/actions/:request_id?grade_state=OPEN` - Επιστροφή `can_request`, `can_view`

#### Δημόσια / Καθηγητής

* `GET /reviews/pending-requests` - Εκκρεμή αιτήματα καθηγητή
* `GET /reviews/request/:request_id/message` - Μήνυμα αιτήματος
* `POST /reviews/new/reply` - Καταγραφή απάντησης καθηγητή και κλείσιμο αιτήματος

#### Υγεία

* `GET /reviews/` - Έλεγχος λειτουργίας (healthcheck)

### Παραδείγματα Ενέργειας Review (grade\_state)

#### OPEN

```json
GET /reviews/actions/123?grade_state=OPEN
→ { "can_request": true, "can_view": false }
```

#### FINAL με ήδη υπάρχον αίτημα

```json
GET /reviews/actions/123?grade_state=FINAL
→ { "can_request": false, "can_view": true }
```

### Απαντήσεις Σφαλμάτων

```json
{
  "success": false,
  "message": "Περιγραφή Σφάλματος"
}
```

Κωδικοί:

* `400`: Ελλιπή ή άκυρα δεδομένα
* `403`: Πρόσβαση χωρίς δικαιώματα
* `404`: Δεν βρέθηκε το αίτημα
* `409`: Αίτημα υπάρχει ήδη
* `500`: Εσωτερικό σφάλμα

### Ανάπτυξη

#### Προαπαιτούμενα

* Node.js 18+
* MySQL 8.0+
* Redis

#### Τοπική Εκκίνηση

```bash
npm install
node src/app.js
```

#### Docker

```bash
docker build -t review-service .
docker run -p 3003:3003 --name review --network clearsky review-service
```

### Δομή Έργου

```
review-service/
├── src/
│   ├── controllers/         # Αιτήσεις & απαντήσεις
│   ├── models/              # Request & Reply μοντέλα
│   ├── routes/              # Ορισμοί endpoints
│   ├── services/            # Συνδυαστικές λειτουργίες
│   ├── utils/               # Redis / DB helpers
│   ├── middlewares/         # Token auth / error handling
│   ├── config.js            # Config
│   └── app.js               # Entry point
├── db_init.sql
├── Dockerfile
├── package.json
└── README.md
```

### Ασφάλεια & Περιορισμοί

* Ένα ενεργό αίτημα ανά φοιτητή/μάθημα/περίοδο
* Μόνο φοιτητές μπορούν να αιτηθούν, μόνο καθηγητές να απαντήσουν
* Οι απαντήσεις κλείνουν αυτόματα το αίτημα (request\_state → CLOSED)
* Όλα τα endpoints προστατεύονται από `validateToken`

### Παρατηρήσεις

* Οι αιτήσεις και οι απαντήσεις κρατούν timestamps για auditing
* Η υπηρεσία λειτουργεί με άλλα microservices μέσω session-based auth
* Μπορεί να ερωτάται από orchestrator για ενέργειες χρήστη
