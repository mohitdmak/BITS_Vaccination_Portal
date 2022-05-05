/** 
    Settings for Admin controllers 
    @admin_excelfile  - Path to store generated admin excel file for student data
    @pagination_limit - Maximum no of students to show in 1 page for admin client
    @allow_access     - Default batches allowed to login to the portal
    @not_known_msg    - Message to display for fields not known about to admin excelfile
    @dose_cooldown_** - Cooldown time for student's current vaccine dose
*/
/** 
    Settings for Auth controllers 
    @redirection_url - Path to redirect user to after successful oauth2 login
    @project_root_url - Path to redirect user to after logout or upon auth
    @administrators - Portal admins will always be allowed to login 
    @allowed_email_domain - Only email addresses with this domain shall be allowed to login
    @oauth2_scopes - The only information accessed by the portal from student's oauth2 token
*/
/** 
    Settings for Student controllers 
    @vaccination_pdfs_storage - Path on server to store posted certificate pdfs
    @consent_pdfs_storage - Path on server to store posted consent form pdfs
    @min_match_required - Minimum extent of matching required of name between BITS email and cert info
*/
/**
    General Settings
    @timezone_current - To be used for all date parsing and setting
    @timezone_diff - Difference from standard timezone
    @mailgun_domain - Email domain from which Critical Logs will be mailed to admin
    @sentry_dsn - DSN at which statistics and traces will be captured
*/

export const ADMIN_EXCELFILE = 'STUDENT_DATA.xlsx';
export const PAGINATION_LIMIT = 50;
/**
    "f" / "h" for first/higher degree
    + batch (2020/2019/2018/2017...)
*/
export const ALLOW_ACCESS: string[] = [];
export const NOT_KNOWN_MSG = 'Data unavailable';
export const DOSE_COOLDOWN_COVISHIELD = 84;
export const DOSE_COOLDOWN_COVAXIN = 28;
export const DOSE_COOLDOWN_SPUTNIK_V = 21;

export const ALLOWED_EMAIL_DOMAIN = 'pilani.bits-pilani.ac.in';
export const OAUTH2_SCOPES: string[] = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
];
export const ADMINISTRATORS: string[] = [
    'f20200048@pilani.bits-pilani.ac.in', // MOHIT MAKWANA
    'f20201229@pilani.bits-pilani.ac.in', // PARTH SHARMA
    'f20190024@pilani.bits-pilani.ac.in', // NIDHEESH JAIN
    'f20190663@pilani.bits-pilani.ac.in', // DARSH MISHRA
    'f20190363@pilani.bits-pilani.ac.in', // ANSHAL SHUKLA
];
export let HOST: string;
if (process.env.API_ENV === 'development') {
    HOST = 'http://localhost:1370';
} else if (process.env.API_ENV === 'production') {
    HOST = 'https://vaccination.bits-dvm.org';
} else if (process.env.API_ENV === 'swd_production') {
    HOST = 'https://swdservices.bits-pilani.ac.in';
} else {
    HOST = 'DevContainer:3000';
}
export const REDIRECTION_URL: string = HOST + '/api/auth/oauthCallback';
export const PROJECT_ROOT_URL = '/rejoining';

export const VACCINATION_PDFS_STORAGE = './src/media/pdf/';
export const CONSENT_PDFS_STORAGE = './src/media/consent/';
export const MIN_MATCH_REQUIRED = 2;

export const TIMEZONE_CURRENT = 'Asia/Kolkata';
export const TIMEZONE_DIFF = 19800000;
export const SENTRY_DSN = 'https://82f368f549ed43fbb3db4437ac2b2c79@o562134.ingest.sentry.io/5923095';
export const MAILGUN_DOMAIN = 'sandbox03e7b28e47f7491980efea3fafbb21f5.mailgun.org';
