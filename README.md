# NTUA ECE SAAS 2025 PROJECT - clearSKY

## ΟΜΑΔΑ 39
| Full Name             | Registration Number  |
| --------------------- | -------------------- |
| Ιωάννης Μπασδέκης     | 03119198             |
| Ιωάννης Δρέσσος       | 03119608             |
| Κρίτων Ιορδανίδης     | 03119604             |
| Παναγιώτης Τσάκωνας   | 03119610             |

## Περιγραφή Έργου

Η πλατφόρμα **clearSKY** είναι ένα σύστημα διαχείρισης βαθμολογικών δεδομένων, υλοποιημένο με αρχιτεκτονική μικροϋπηρεσιών (microservices). Το σύστημα παρέχει λειτουργίες για τη διαχείριση μαθημάτων, βαθμολογιών, και αιτημάτων αναθεώρησης σε εκπαιδευτικά ιδρύματα.

## Αρχιτεκτονική Συστήματος

Η πλατφόρμα αποτελείται από τα ακόλουθα microservices, καθένα με συγκεκριμένη λειτουργικότητα:

### 1. User Management Microservice
- **Λειτουργία**: Διαχείριση όλων των χρηστών του συστήματος (μαθητές, καθηγητές, διαχειριστές ιδρυμάτων)
- **Τεχνολογία**: Node.js
- **Θύρα REST API**: 3005
- **Βάση δεδομένων**: Ξεχωριστή σχεσιακή βάση (Port: 3306)
- **Οντότητες**: User (id, username, email, role)

### 2. Authentication Microservice
- **Λειτουργία**: Παρέχει υπηρεσίες ταυτοποίησης και ελέγχου πρόσβασης
- **Χαρακτηριστικά**:
  * Επικοινωνεί με το User Management για επαλήθευση στοιχείων χρήστη
  * Δημιουργεί και διαχειρίζεται tokens συνεδρίας (session tokens)
  * Ελέγχει την εγκυρότητα των tokens για κάθε αίτημα προς άλλα microservices
- **Τεχνολογία**: Node.js
- **Θύρα REST API**: 3001
- **Βάση δεδομένων**: Redis (για διαχείριση sessions)

### 3. Course/Grading Microservice
- **Λειτουργία**: Διαχείριση μαθημάτων και βαθμολογιών
- **Χαρακτηριστικά**:
  * Αποθήκευση πληροφοριών για μαθήματα
  * Διαχείριση εγγραφών μαθητών σε μαθήματα
  * Καταχώρηση και διαχείριση βαθμολογιών
- **Τεχνολογία**: Node.js
- **Θύρα REST API**: 3002
- **Βάση δεδομένων**: Ξεχωριστή σχεσιακή βάση (Port: 3306)
- **Οντότητες**: Course, Grade

### 4. Review Microservice
- **Λειτουργία**: Διαχείριση αιτημάτων αναθεώρησης βαθμολογιών
- **Χαρακτηριστικά**:
  * Υποβολή αιτημάτων αναθεώρησης βαθμολογίας
  * Διαχείριση κατάστασης αιτημάτων (PENDING, ADDRESSED)
- **Τεχνολογία**: Node.js
- **Θύρα REST API**: 3003
- **Βάση δεδομένων**: Ξεχωριστή σχεσιακή βάση (Port: 3306)
- **Οντότητες**: ReviewRequest

### 5. Statistics Microservice
- **Λειτουργία**: Συλλογή και επεξεργασία στατιστικών δεδομένων
- **Χαρακτηριστικά**:
  * Υπολογισμός μέσων όρων βαθμολογιών
  * Εξαγωγή υψηλότερων και χαμηλότερων βαθμών
  * Ανάλυση επιδόσεων ανά μάθημα
- **Τεχνολογία**: Node.js
- **Θύρα REST API**: 3004
- **Βάση δεδομένων**: Ξεχωριστή σχεσιακή βάση (Port: 3306)
- **Οντότητες**: Statistics

### 6. Frontend Container
- **Λειτουργία**: Διεπαφή χρήστη
- **Τεχνολογία**: HTML/JavaScript
- **Θύρα**: 80

## Μοντέλο Δεδομένων

Το σύστημα περιλαμβάνει τις ακόλουθες κύριες οντότητες:

### User
- **Ιδιότητες**: id, username, email, role
- **Ρόλοι**: STUDENT, INSTRUCTOR, INSTITUTION_REPRESENTATIVE
- **Λειτουργίες**: createUser, updateUser, deleteUser, getUserInfo, getCourses, getGrades

### AuthToken
- **Ιδιότητες**: token, userId, expiresAt
- **Λειτουργίες**: generateToken, validateToken, expireToken

### Course
- **Ιδιότητες**: id, name, startDate, endDate, instructorIds
- **Λειτουργίες**: createCourse, updateCourse, deleteCourse, getCourseDetails, getTempGrades, getGrades, assignInstructor, getInstructors

### Grade
- **Ιδιότητες**: id, studentId, courseId, initialGrade, finalGrade, status
- **Καταστάσεις**: VOID, OPEN, FINAL
- **Λειτουργίες**: recordInitialGrade, updateFinalGrade, getGradeStatus, calculateGrade

### ReviewRequest
- **Ιδιότητες**: id, gradeId, studentId, message, status, reply
- **Καταστάσεις**: PENDING, ADDRESSED
- **Λειτουργίες**: submitReviewRequest, replyReviewRequest, getReviewStatus

### Statistics
- **Ιδιότητες**: courseId, averageGrade, highestGrade, lowestGrade
- **Λειτουργίες**: computeStatistics, getAverageGrade, getHighestGrade, getLowestGrade, getAllGrades

## Σχέσεις Μεταξύ Οντοτήτων

- Ένας **User** μπορεί να διδάσκει ή να παρακολουθεί πολλά **Courses** (σχέση 0..* προς 1..*)
- Ένας **User** λαμβάνει πολλά **Grades** (σχέση 1 προς 0..*)
- Ένα **Grade** μπορεί να έχει μία **ReviewRequest** (σχέση 1 προς 0..1)
- Ένας **User** κατέχει πολλά **AuthTokens** (σχέση 1 προς 0..*)

## Τεχνολογίες Υλοποίησης

- **Backend**: Node.js για όλα τα microservices
- **Frontend**: HTML/JavaScript
- **Βάσεις Δεδομένων**:
  * Σχεσιακές βάσεις για όλα τα microservices εκτός του Authentication
  * Redis για το Authentication Microservice
  * Προτεινόμενη λύση: Amazon Aurora Serverless v2 (συμβατό με MySQL/MariaDB)

## Επικοινωνία Μεταξύ Microservices

Όλα τα microservices επικοινωνούν μέσω REST APIs:
- Authentication Service (3001)
- Course/Grading Service (3002)
- Review Service (3003)
- Statistics Service (3004)
- User Management Service (3005)

## Ασφάλεια

- Το Authentication Microservice παρέχει tokens συνεδρίας μετά από επιτυχημένη σύνδεση
- Όλα τα άλλα microservices επαληθεύουν την εγκυρότητα των tokens και τα δικαιώματα του χρήστη πριν την εκτέλεση αιτημάτων
- Τα δεδομένα των χρηστών αποθηκεύονται με ασφάλεια σε ξεχωριστές βάσεις δεδομένων

## Εγκατάσταση και Εκτέλεση

Το σύστημα λειτουργεί σε περιβάλλον Docker με κάθε microservice να τρέχει σε ξεχωριστό container.

---

*Το έργο αναπτύσσεται στα πλαίσια του μαθήματος Τεχνολογίες Υπηρεσιών Λογισμικού, Τμήμα Ηλεκτρολόγων Μηχανικών και Μηχανικών Υπολογιστών, Εθνικό Μετσόβιο Πολυτεχνείο, 2025.*