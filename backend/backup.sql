--
-- PostgreSQL database dump
--

-- Dumped from database version 17.3
-- Dumped by pg_dump version 17.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'WIN1252';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: blog; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA blog;


ALTER SCHEMA blog OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blogs; Type: TABLE; Schema: blog; Owner: postgres
--

CREATE TABLE blog.blogs (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    author_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description character varying(400) NOT NULL
);


ALTER TABLE blog.blogs OWNER TO postgres;

--
-- Name: blogs_id_seq; Type: SEQUENCE; Schema: blog; Owner: postgres
--

CREATE SEQUENCE blog.blogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE blog.blogs_id_seq OWNER TO postgres;

--
-- Name: blogs_id_seq; Type: SEQUENCE OWNED BY; Schema: blog; Owner: postgres
--

ALTER SEQUENCE blog.blogs_id_seq OWNED BY blog.blogs.id;


--
-- Name: comments; Type: TABLE; Schema: blog; Owner: postgres
--

CREATE TABLE blog.comments (
    id integer NOT NULL,
    blog_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE blog.comments OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: blog; Owner: postgres
--

CREATE SEQUENCE blog.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE blog.comments_id_seq OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: blog; Owner: postgres
--

ALTER SEQUENCE blog.comments_id_seq OWNED BY blog.comments.id;


--
-- Name: users; Type: TABLE; Schema: blog; Owner: postgres
--

CREATE TABLE blog.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'user'::character varying])::text[])))
);


ALTER TABLE blog.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: blog; Owner: postgres
--

CREATE SEQUENCE blog.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE blog.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: blog; Owner: postgres
--

ALTER SEQUENCE blog.users_id_seq OWNED BY blog.users.id;


--
-- Name: blogs id; Type: DEFAULT; Schema: blog; Owner: postgres
--

ALTER TABLE ONLY blog.blogs ALTER COLUMN id SET DEFAULT nextval('blog.blogs_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: blog; Owner: postgres
--

ALTER TABLE ONLY blog.comments ALTER COLUMN id SET DEFAULT nextval('blog.comments_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: blog; Owner: postgres
--

ALTER TABLE ONLY blog.users ALTER COLUMN id SET DEFAULT nextval('blog.users_id_seq'::regclass);


--
-- Data for Name: blogs; Type: TABLE DATA; Schema: blog; Owner: postgres
--

COPY blog.blogs (id, title, content, author_id, created_at, updated_at, description) FROM stdin;
15	Real-Time Web Applications with WebSockets in Node.js	<p><strong>Introduction</strong></p><p>Traditional HTTP requests follow a request-response model, where the client sends a request, and the server responds. This works well for static pages but falls short in real-time applications. WebSockets solve this by maintaining an open connection, allowing instant data exchange.</p><h4><strong>How WebSockets Work</strong></h4><ol><li><p>The client initiates a WebSocket handshake via HTTP.</p></li><li><p>The server responds and upgrades the connection to WebSocket.</p></li><li><p>Both parties can now send and receive messages asynchronously.</p></li></ol><h4><strong>Setting Up WebSockets in Node.js</strong></h4><p>Let's create a simple WebSocket server in Node.js using the <code>ws</code> library.</p><p></p><p><strong>Step 1: Install Dependencies</strong></p><pre><code>      npm init -y </code></pre><p>            npm install ws express</p><p></p><p></p><p>WebSockets provide an efficient way to build real-time applications. By maintaining persistent connections, they enable instant updates without constant polling. You can extend this example to create chat apps, notification systems, and live dashboards.</p><p></p>	6	2025-03-04 08:20:51.426924	2025-03-04 08:20:51.426924	WebSockets enable real-time, bidirectional communication between clients and servers, making them ideal for applications like live chat, stock price updates, and collaborative tools. In this blog, weÆll explore how WebSockets work and implement them in a Node.js application using the ws library.
16	Implementing Role-Based Authentication in Node.js with JWT	<h3><strong>Content Outline:</strong></h3><h4><strong>1. Introduction</strong></h4><ul><li><p>What is role-based authentication?</p></li><li><p>Why use JWT for authentication?</p></li></ul><h4><strong>2. Setting Up the Node.js Project</strong></h4><ul><li><p>Install dependencies:</p></li></ul><blockquote><p>npm init -y  <br>npm install express mongoose bcryptjs jsonwebtoken dotenv </p></blockquote><p></p><h4><strong>3. Creating User Roles</strong></h4><ul><li><p>Define roles (<code>admin</code>, <code>user</code>, <code>editor</code>) in the User model.</p><p></p></li></ul><h4><strong>4. Implementing JWT Authentication</strong></h4><ul><li><p>Hash passwords using <code>bcrypt.js</code>.</p></li><li><p>Generate and verify JWT tokens.</p><p></p></li></ul><h4><strong>5. Protecting Routes with Middleware</strong></h4><ul><li><p>Create an <code>authMiddleware.js</code> to check user roles.</p><p></p></li></ul><h4><strong>6. Testing the Authentication System</strong></h4><ul><li><p>Use <strong>Postman</strong> to test registration, login, and protected routes.</p><p></p></li></ul><h4><strong>7. Conclusion</strong></h4><ul><li><p>How RBAC enhances security and can be expanded with permissions.</p></li></ul><p></p><p></p><p>  </p>	6	2025-03-04 08:31:58.145629	2025-03-04 08:31:58.145629	Role-based authentication ensures users have the correct permissions based on their role (e.g., admin, user, editor). In this blog, we'll use Node.js, Express, MongoDB, and JWT to implement a secure authentication system with role-based access control (RBAC).
17	 Building an Interactive Data Visualization Dashboard with D3.js	<h3><strong>Content Outline:</strong></h3><h4><strong>1. Introduction to D3.js</strong></h4><ul><li><p>Why use D3.js for data visualization?</p></li><li><p>Key features of D3.js</p><p></p></li></ul><h4><strong>2. Setting Up the React Project</strong></h4><ul><li><p>Install dependencies:</p><blockquote><p><code>npx create-vite@latest d3-dashboard --template react  </code></p><p><code>cd d3-dashboard   </code></p><p><code>npm install d3 tailwindcss  </code></p></blockquote></li></ul><p></p><h4><strong>3. Creating a Bar Chart with D3.js</strong></h4><ul><li><p>Use <code>useEffect</code> in React to render a chart.</p><p></p></li></ul><h4><strong>4. Adding Interactivity</strong></h4><ul><li><p>Implement hover effects and dynamic updates.</p><p></p></li></ul><h4><strong>5. Fetching Real Data from an API</strong></h4><ul><li><p>Integrate data from an API to update the visualization dynamically.</p><p></p></li></ul><h4><strong>6. Deploying the Dashboard</strong></h4><ul><li><p>Host it on <strong>Vercel</strong> or <strong>Netlify</strong>.</p><p></p></li></ul><h4><strong>7. Conclusion</strong></h4><ul><li><p>How to extend the dashboard with different chart types.</p></li></ul>	6	2025-03-04 08:34:57.726059	2025-03-04 08:34:57.726059	D3.js is a powerful library for creating interactive charts and visualizations. In this blog, we'll use React, D3.js, and Tailwind CSS to build a simple data visualization dashboard displaying dynamic charts.
18	Optimizing Django API Performance: Caching, Pagination & Query Optimization	<h4><strong>1. Introduction to API Performance Optimization</strong></h4><ul><li><p>Why API speed matters</p></li><li><p>Common bottlenecks in Django APIs</p><p></p></li></ul><h4><strong>2. Implementing Caching with Redis</strong></h4><ul><li><p>Install Redis and configure Django caching:</p><blockquote><p>pip install django-redis  </p></blockquote></li></ul><h4><strong>3. Optimizing Database Queries</strong></h4><ul><li><p>Use <strong>select_related</strong> and <strong>prefetch_related</strong> for query optimization.</p></li><li><p>Reduce database hits by avoiding N+1 queries.</p></li></ul><p></p><h4><strong>4. Implementing Pagination in Django REST Framework</strong></h4><ul><li><p>Use <code>PageNumberPagination</code> and <code>LimitOffsetPagination</code>.</p><p></p></li></ul><h4><strong>5. Profiling API Performance</strong></h4><ul><li><p>Use <code>django-silk</code> or <code>debug-toolbar</code> for performance monitoring.</p><p></p></li></ul><h4><strong>6. Conclusion</strong></h4><ul><li><p>Summary of techniques to improve Django API speed.</p></li></ul><p></p>	6	2025-03-04 08:40:38.560912	2025-03-04 08:40:38.560912	Django REST Framework (DRF) is great for building APIs, but performance bottlenecks can occur due to database queries and response sizes. This blog will cover caching, pagination, and query optimization techniques to make Django APIs faster.
19	Implementing WebSockets in Django with Django Channels	<h4><strong>1. Introduction to Django Channels</strong></h4><ul><li><p>Why DjangoÆs default request-response model isnÆt enough for real-time applications.</p></li><li><p>How Django Channels helps with WebSockets and real-time updates.</p><p></p></li></ul><h4><strong>2. Setting Up Django Channels</strong></h4><ul><li><p>Install dependencies:</p><blockquote><p><code>pip install django-channels   </code></p></blockquote></li><li><p>Configure <strong>ASGI</strong> in <code>settings.py</code>.</p><p></p></li></ul><h4><strong>3. Creating a WebSocket Consumer</strong></h4><ul><li><p>Write a Django <strong>WebSocket consumer</strong> to handle connections.</p></li><li><p>Define WebSocket URL routing.</p><p></p></li></ul><h4><strong>4. Building a Chat Application</strong></h4><ul><li><p>Create a simple frontend to send and receive real-time messages.</p></li><li><p>Store chat messages in a database.</p><p></p></li></ul><h4><strong>5. Deploying the WebSocket App</strong></h4><ul><li><p>Use <strong>Daphne</strong> for deployment.</p><p></p></li></ul><h4><strong>6. Conclusion</strong></h4><ul><li><p>How Django Channels can be extended for notifications, dashboards, and IoT applications.</p></li></ul>	6	2025-03-04 08:41:49.778511	2025-03-04 08:41:49.778511	Django Channels extends Django to handle real-time applications using WebSockets. In this blog, we will build a real-time chat application using Django, Django Channels, and WebSockets.
20	Implementing Role-Based Access Control (RBAC) in React with Firebase	<h4><strong>1. Introduction to Firebase Authentication</strong></h4><ul><li><p>Why Firebase is useful for authentication.</p></li><li><p>How RBAC works in Firebase.</p><p></p></li></ul><h4><strong>2. Setting Up Firebase Authentication in React</strong></h4><ul><li><p>Install Firebase SDK and initialize the project.</p></li><li><p>Configure <strong>Google Sign-In and Email/Password authentication</strong>.</p><p></p></li></ul><h4><strong>3. Assigning Roles to Users</strong></h4><ul><li><p>Store user roles in Firestore (<code>admin</code>, <code>moderator</code>, <code>user</code>).</p><p></p></li></ul><h4><strong>4. Implementing Role-Based Protected Routes</strong></h4><ul><li><p>Use <strong>React Router</strong> and <code>useContext</code> to manage access.</p></li><li><p>Redirect users based on their roles.</p><p></p></li></ul><h4><strong>5. Testing &amp; Deployment</strong></h4><ul><li><p>Test with different user roles.</p></li><li><p>Deploy on Firebase Hosting.</p><p></p></li></ul><h4><strong>6. Conclusion</strong></h4><ul><li><p>How RBAC improves security in Firebase applications.</p></li></ul>	6	2025-03-04 08:42:35.895687	2025-03-04 08:42:35.895687	Firebase Authentication provides a simple way to implement role-based access control (RBAC). This blog will guide you through creating an authentication system where users have different roles (admin, user, moderator).
21	Building a Serverless API with AWS Lambda and API Gateway	<h4><strong>1. Introduction to Serverless Architecture</strong></h4><ul><li><p>What is Serverless Computing?</p></li><li><p>Benefits of AWS Lambda over traditional servers.</p></li></ul><p></p><h4><strong>2. Setting Up AWS Lambda and API Gateway</strong></h4><ul><li><p>Create a Lambda function using Python.</p></li><li><p>Deploy it using AWS Console or the AWS CLI.</p><p></p></li></ul><h4><strong>3. Connecting Lambda to API Gateway</strong></h4><ul><li><p>Expose the Lambda function as a RESTful API.</p></li><li><p>Enable CORS for frontend access.</p><p></p></li></ul><h4><strong>4. Storing Data in DynamoDB</strong></h4><ul><li><p>Create a table to store API data.</p></li><li><p>Read and write data using AWS SDK.</p><p></p></li></ul><h4><strong>5. Testing the API</strong></h4><ul><li><p>Use <strong>Postman</strong> or a frontend app to test endpoints.</p><p></p></li></ul><h4><strong>6. Deploying the Serverless API</strong></h4><ul><li><p>Use AWS CloudFormation for deployment.</p><p></p></li></ul><h4><strong>7. Conclusion</strong></h4><ul><li><p>How serverless APIs reduce costs and improve scalability</p></li></ul>	6	2025-03-04 08:43:47.101745	2025-03-04 08:43:47.101745	Serverless computing allows developers to build scalable APIs without managing servers. This blog will guide you through building a RESTful API using AWS Lambda, API Gateway, and DynamoDB.
22	Introduction to Rust: The Memory-Safe Programming Language	<p><strong>Key Topics:</strong></p><ul><li><p>What is Rust, and why use it?</p></li><li><p>RustÆs ownership and borrowing system.</p></li><li><p>Writing a simple Rust program.</p></li><li><p>Comparing Rust with C++ in terms of performance and safety.</p></li><li><p>Where Rust is used (e.g., WebAssembly, OS development, blockchain).</p></li></ul>	6	2025-03-04 08:44:41.555528	2025-03-04 08:44:41.555528	Rust is gaining popularity due to its safety and performance. This blog introduces Rust, its unique ownership model, and why it's preferred over C/C++.
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: blog; Owner: postgres
--

COPY blog.comments (id, blog_id, user_id, content, created_at) FROM stdin;
1	22	9	nice infomation	2025-03-04 14:31:06.444653
3	21	9	jkj	2025-03-04 17:22:37.649321
4	21	9	jkj	2025-03-04 17:22:41.129207
5	20	9	firebase	2025-03-04 17:24:41.571667
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: blog; Owner: postgres
--

COPY blog.users (id, username, email, password, role, created_at) FROM stdin;
6	admin	admin@123.com	$2a$12$BeEDzPtDzLYNasZu2OPuee1g.toq8RxbofP3qaZgjSueTRXGbifAG	admin	2025-02-22 18:40:55.153263
9	niranjan363	dadd@ff.com	$2a$12$pyyJ7TmIrjzI84YIFuJRK.wFZWB7br3eAWaSmbI5zcugkRnGoFUx.	user	2025-02-26 13:53:00.3295
10	john3	john@39.com	$2a$12$F59UNVZbikHPAC4sa4teOuzBwDS15DqeRbLO/mWCZPebFWFLhV39m	user	2025-02-26 13:53:15.416066
\.


--
-- Name: blogs_id_seq; Type: SEQUENCE SET; Schema: blog; Owner: postgres
--

SELECT pg_catalog.setval('blog.blogs_id_seq', 24, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: blog; Owner: postgres
--

SELECT pg_catalog.setval('blog.comments_id_seq', 37, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: blog; Owner: postgres
--

SELECT pg_catalog.setval('blog.users_id_seq', 11, true);


--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: blog; Owner: postgres
--

ALTER TABLE ONLY blog.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: blog; Owner: postgres
--

ALTER TABLE ONLY blog.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: blog; Owner: postgres
--

ALTER TABLE ONLY blog.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: blog; Owner: postgres
--

ALTER TABLE ONLY blog.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: blog; Owner: postgres
--

ALTER TABLE ONLY blog.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: blogs blogs_author_id_fkey; Type: FK CONSTRAINT; Schema: blog; Owner: postgres
--

ALTER TABLE ONLY blog.blogs
    ADD CONSTRAINT blogs_author_id_fkey FOREIGN KEY (author_id) REFERENCES blog.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_blog_id_fkey; Type: FK CONSTRAINT; Schema: blog; Owner: postgres
--

ALTER TABLE ONLY blog.comments
    ADD CONSTRAINT comments_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES blog.blogs(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: blog; Owner: postgres
--

ALTER TABLE ONLY blog.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES blog.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

