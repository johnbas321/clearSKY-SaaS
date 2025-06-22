# MICROSERVICE

## Authentication Microservice

Node.js microservice για αυθεντικοποίηση χρηστών στην πλατφόρμα clearSKY.

### Χαρακτηριστικά

* **Login & Logout**: Είσοδος και έξοδος χρηστών μέσω cookies
* **Διαχείριση Συνεδριών**: Αποθήκευση και έλεγχος sessions μέσω Redis
* **Αλληλεπίδραση με Userman**: Ανάκτηση στοιχείων χρήστη από την υπηρεσία διαχείρισης χρηστών (`userman`)
* **Επαλήθευση Κωδικών**: Hash με χρήση `scrypt` και δυναμικού salt
* **Cookies HTTP-Only**: Ασφαλής αποθήκευση session ID
* **Κεντρική Διαχείριση Σφαλμάτων**: Middleware για σαφείς και συνεπείς απαντήσεις

### API Endpoints

#### Αυθεντικοποίηση

* `POST /login` - Σύνδεση χρήστη με email και κωδικό
* `POST /logout` - Αποσύνδεση χρήστη (διαγραφή session)

### Παραδείγματα Αιτήσεων/Απαντήσεων

#### Είσοδος Χρήστη

```bash
POST /login
Content-Type: application/json

{
  "email": "giannis@example.com",
  "password": "plain_password"
}
```

Απάντηση:

```json
{
  "message": "Logged in successfully"
}
// + Cookie: sessionId set με HttpOnly
```

#### Αποσύνδεση Χρήστη

```bash
POST /logout
```

Απάντηση:

```json
{
  "message": "Logged out successfully"
}
```

### Απαντήσεις Σφαλμάτων

```json
{
  "success": false,
  "message": "General error description"
}
```

Συνηθισμένοι Κωδικοί Κατάστασης:

* `400` - Κακή Αίτηση (π.χ. απουσία sessionId)
* `401` - Μη Εξουσιοδοτημένος (λάθος κωδικός)
* `404` - Δεν Βρέθηκε (email μη καταχωρημένο)
* `405` - Μέθοδος μη υποστηριζόμενη
* `500` - Εσωτερικό Σφάλμα Διακομιστή

### Ρύθμιση Ανάπτυξης

#### Προαπαιτούμενα

* Node.js 18+
* Redis
* Docker & Docker Compose (προαιρετικό)

#### Τοπική Ανάπτυξη

1. **Εγκατάσταση Εξαρτήσεων**

```bash
npm install
```

2. **Εκκίνηση Ανάπτυξης**

```bash
node src/index.js
```

#### Ανάπτυξη με Docker

```bash
docker build -t microservice_auth .
docker run -p 3001:3001 --name auth --network clearsky microservice_auth
```

### Δομή Έργου

```
microservice_auth/
├── src/
│   ├── controllers/
│   │   └── controllers.js        # Είσοδος και έξοδος χρήστη
│   ├── errors/
│   │   └── usageError.js         # Προσαρμοσμένα σφάλματα (UsageError)
│   ├── middlewares/
│   │   └── errorHandler.js       # Κεντρική διαχείριση σφαλμάτων
│   ├── routes/
│   │   └── routes.js             # Ορισμός διαδρομών login/logout
│   ├── utils/
│   │   └── redisClient.js        # Redis client σύνδεση
│   └── index.js                  # Είσοδος εφαρμογής
├── Dockerfile
├── package.json
└── README.md
```

### Διαχείριση Συνεδριών

* **Storage**: Redis (`sess:<uuid>`)
* **Διάρκεια**: 24 ώρες (`EX: 86400`)
* **Περιεχόμενα**:

```json
{
  "userId": 1,
  "role": "STUDENT",
  "userName": "Giannis Papadopoulos",
  "email": "giannis@example.com"
}
```

* **Cookie**: `sessionId` με `HttpOnly`, `SameSite: Lax`

### Σημειώσεις Ασφαλείας

* Δεν αποθηκεύεται απλός κωδικός χρήστη ποτέ
* Όλες οι ευαίσθητες λειτουργίες είναι προστατευμένες μέσω σφαλμάτων και έλεγχων τύπων
* Ενδεχόμενη επέκταση: χρήση JWT ή secure cookie flags σε παραγωγή

### Επικοινωνία Μεταξύ Υπηρεσιών

* **Userman**: Ανακτά χρήστες μέσω `GET http://userman:3005/users/email/:email`
* **Redis**: Χρησιμοποιείται για αποθήκευση sessions
* **Frontend**: Βασίζεται σε cookie `sessionId` για διαχείριση κατάστασης χρήστη
