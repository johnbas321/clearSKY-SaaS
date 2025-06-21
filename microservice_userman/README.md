# MICROSERVICE

## User Management Microservice

Node.js microservice για τη διαχείριση χρηστών στην πλατφόρμα clearSKY.

### Χαρακτηριστικά

- **Λειτουργίες CRUD**: Δημιουργία, ανάγνωση, ενημέρωση και διαγραφή χρηστών
- **Διαχείριση Ρόλων**: Υποστήριξη για ρόλους STUDENT, INSTRUCTOR, και INSTITUTION_ADMIN
- **Επικύρωση Email**: Εξασφαλίζει μοναδικές διευθύνσεις email
- **Επικύρωση Εισόδου**: Ολοκληρωμένο middleware επικύρωσης
- **Διαχείριση Σφαλμάτων**: Κεντρική διαχείριση σφαλμάτων με σαφείς απαντήσεις
- **Έλεγχοι Υγείας**: Ενσωματωμένα endpoints παρακολούθησης υγείας (health check)
- **Στατιστικά**: Endpoints για πλήθος χρηστών και κατανομή ρόλων

### User Model

```javascript
{
  id: INTEGER (Primary Key, Auto Increment),
  full_name: VARCHAR(255),
  email: VARCHAR(255) UNIQUE,
  password_salt: VARCHAR(255),
  password_hash: VARCHAR(255),
  role: ENUM('STUDENT', 'INSTRUCTOR', 'INSTITUTION_ADMIN'),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### API Endpoints

#### Υγεία & Πληροφορίες
- `GET /` - Πληροφορίες υπηρεσίας
- `GET /users/health` - Έλεγχος υγείας
- `GET /users/stats` - Στατιστικά χρηστών

#### Διαχείριση Χρηστών
- `POST /users` - Δημιουργία νέου χρήστη
- `GET /users` - Λήψη όλων των χρηστών (με προαιρετικά φίλτρα)
- `GET /users/:id` - Λήψη χρήστη με ID
- `PUT /users/:id` - Ενημέρωση χρήστη
- `DELETE /users/:id` - Διαγραφή χρήστη
- `GET /users/email/:email` - Λήψη χρήστη με email (για υπηρεσία auth)

#### Παράμετροι Ερωτήματος

##### GET /users
- `role` - Φιλτράρισμα με ρόλο (STUDENT, INSTRUCTOR, INSTITUTION_ADMIN)
- `search` - Αναζήτηση σε full_name και email
- `limit` - Περιορισμός αριθμού αποτελεσμάτων
- `include_auth` - Συμπερίληψη δεδομένων κωδικού (true/false)

##### GET /users/:id
- `include_auth` - Συμπερίληψη δεδομένων κωδικού (true/false)

### Παραδείγματα Αιτήσεων/Απαντήσεων

#### Δημιουργία Χρήστη
```bash
POST /users
Content-Type: application/json

{
  "full_name": "Giannis Papadopoulos",
  "email": "giannis.papadopoulos@example.com",
  "password_salt": "random_salt_string",
  "password_hash": "hashed_password_string",
  "role": "STUDENT"
}
```

Απάντηση:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "full_name": "Giannis Papadopoulos",
    "email": "giannis.papadopoulos@example.com",
    "role": "STUDENT",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Λήψη Χρηστών με Φίλτρα
```bash
GET /users?role=STUDENT&search=giannis&limit=10
```

#### Ενημέρωση Χρήστη
```bash
PUT /users/1
Content-Type: application/json

{
  "full_name": "Giannis Papadopoulos",
  "role": "INSTRUCTOR"
}
```

#### Λήψη Στατιστικών Χρηστών
```bash
GET /users/stats
```

Απάντηση:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "by_role": {
      "student": 120,
      "instructor": 25,
      "institution_admin": 5
    }
  }
}
```

### Απαντήσεις Σφαλμάτων

Όλα τα σφάλματα ακολουθούν αυτή τη μορφή:
```json
{
  "success": false,
  "message": "General error description",
  "errors": ["Error messages"] // Προαιρετικός πίνακας για σφάλματα επικύρωσης
}
```

Συνήθεις κωδικοί κατάστασης HTTP:
- `400` - Κακή Αίτηση (σφάλματα επικύρωσης)
- `404` - Δεν Βρέθηκε
- `409` - Σύγκρουση (διπλότυπο email)
- `500` - Εσωτερικό Σφάλμα Διακομιστή
- `503` - Υπηρεσία Μη Διαθέσιμη (προβλήματα σύνδεσης βάσης δεδομένων)

### Ρύθμιση Ανάπτυξης

#### Προαπαιτούμενα
- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose (προαιρετικό)

#### Τοπική Ανάπτυξη

1. **Κλωνοποίηση και εγκατάσταση εξαρτήσεων:**
```bash
npm install
```

2. **Ρύθμιση μεταβλητών περιβάλλοντος:**
```bash
cp .env.example .env
# Επεξεργαστείτε το .env με τα διαπιστευτήρια της βάσης δεδομένων σας
```

3. **Ρύθμιση βάσης δεδομένων:**
```bash
# Δημιουργήστε βάση δεδομένων και εκτελέστε το script db_init.sql
mysql -u root -p < db_init.sql
```

4. **Εκκίνηση διακομιστή ανάπτυξης:**
```bash
npm run dev
```

#### Ανάπτυξη με Docker

1. **Κατασκευή και εκκίνηση υπηρεσιών:**
```bash
docker-compose up -d userman userman-db
```

2. **Προβολή logs:**
```bash
docker-compose logs -f userman
```

3. **Τερματισμός υπηρεσιών:**
```bash
docker-compose down
```

### Δομή Έργου

```
microservice_userman/
├── src/
│   ├── config/
│   │   └── database.js          # Διαμόρφωση βάσης δεδομένων
│   ├── controllers/
│   │   └── userController.js    # Χειριστές αιτήσεων
│   ├── middlewares/
│   │   ├── errorHandler.js      # Middleware διαχείρισης σφαλμάτων
│   │   └── validation.js        # Middleware επικύρωσης εισόδου
│   ├── models/
│   │   └── User.js              # Μοντέλο χρήστη και λειτουργίες βάσης δεδομένων
│   ├── routes/
│   │   └── userRoutes.js        # Ορισμοί διαδρομών
│   └── index.js                 # Σημείο εισόδου εφαρμογής
├── db_init.sql                  # Script αρχικοποίησης βάσης δεδομένων
├── package.json
├── Dockerfile
└── README.md
```

### Σύνδεση Βάσης Δεδομένων

Η υπηρεσία χρησιμοποιεί `mysql2` με connection pooling για βέλτιστη απόδοση:

- **Pool Συνδέσεων**: Διαχειρίζεται πολλαπλές συνδέσεις βάσης δεδομένων
- **Αυτόματη Επανασύνδεση**: Χειρίζεται αποτυχίες σύνδεσης με χάρη
- **Έλεγχοι Υγείας**: Τακτική επαλήθευση συνδεσιμότητας βάσης δεδομένων
- **Ευγενές Κλείσιμο**: Κλείνει σωστά τις συνδέσεις κατά τον τερματισμό υπηρεσίας

### Κανόνες Επικύρωσης

#### Δημιουργία Χρήστη
- **full_name**: Απαιτείται, μη κενό string, μέγιστο 255 χαρακτήρες
- **email**: Απαιτείται, έγκυρη μορφή email, μοναδικό, μέγιστο 255 χαρακτήρες
- **password_salt**: Απαιτείται, μη κενό string
- **password_hash**: Απαιτείται, μη κενό string
- **role**: Προαιρετικό, πρέπει να είναι ένα από: STUDENT, INSTRUCTOR, INSTITUTION_ADMIN

#### Ενημέρωση Χρήστη
- Τουλάχιστον ένα πεδίο πρέπει να παρέχεται
- Ίδιοι κανόνες επικύρωσης με τη δημιουργία για τα παρεχόμενα πεδία
- Η μοναδικότητα email ελέγχεται εάν το email ενημερώνεται

### Ζητήματα Ασφάλειας

- **Επικύρωση Εισόδου**: Όλες οι είσοδοι επικυρώνονται πριν την επεξεργασία
- **Πρόληψη SQL Injection**: Χρησιμοποιεί παραμετροποιημένα ερωτήματα
- **Ασφάλεια Κωδικών**: Αποθηκεύει μόνο salt και hash, ποτέ απλούς κωδικούς
- **Container μη-root**: Το Docker container εκτελείται ως μη-root χρήστης
- **Πληροφορίες Σφαλμάτων**: Ευαίσθητες πληροφορίες κρυμμένες στην παραγωγή

### Παρακολούθηση & Έλεγχοι Υγείας

- **Υγεία Εφαρμογής**: Endpoint `/users/health` για ελέγχους load balancer
- **Υγεία Βάσης Δεδομένων**: Παρακολούθηση pool συνδέσεων
- **Έλεγχος Υγείας Docker**: Ενσωματωμένη παρακολούθηση υγείας container
- **Ευγενές Κλείσιμο**: Σωστός καθαρισμός σε SIGTERM/SIGINT

### Επικοινωνία Μεταξύ Υπηρεσιών

Αυτή η υπηρεσία έχει σχεδιαστεί για να λειτουργεί με άλλα clearSKY microservices:

- **Υπηρεσία Auth**: Μπορεί να ερωτά χρήστες με email για πιστοποίηση
- **Frontend**: Παρέχει διεπαφή διαχείρισης χρηστών
- **Άλλες Υπηρεσίες**: Μπορούν να επικυρώνουν την ύπαρξη χρηστών και ρόλους