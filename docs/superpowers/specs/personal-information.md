====================================================================================================
OLD WEBSITE
====================================================================================================
<!doctype html>
<!-- Set the color theme -->
<!--!TODO Modify the color theme to be set by the user's preference -->
<html lang="en" data-bs-theme="light">
  <head>
    <!-- Google tag (gtag.js) -->
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-HC8TZ61FWE"
    ></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());

      gtag("config", "G-HC8TZ61FWE");
    </script>

    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />

    <title>Jonathan Tobias da Silva</title>
    <meta content="Portfolio" name="description" />
    <meta content="" name="keywords" />

    <meta property="og:title" content="Jonathan Tobias da Silva" />
    <meta
      property="og:description"
      content="Research and Development Engineer"
    />
    <meta property="og:url" content="https://jontobias.com/" />
    <meta
      property="og:image"
      itemprop="image"
      content="https://jontobias.com/assets/img/profile-img.jpg"
    />
    <meta property="og:image:width" content="300" />
    <meta property="og:image:height" content="300" />
    <meta property="og:type" content="website" />

    <!-- Favicons -->
    <link href="assets/img/jts-logo-2.png" rel="icon" />
    <link href="assets/img/jts-logo-2.png" rel="apple-touch-icon" />

    <!-- Google Fonts -->
    <link
      href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Raleway:300,300i,400,400i,500,500i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i"
      rel="stylesheet"
    />

    <!-- Vendor CSS Files -->
    <link href="assets/vendor/aos/aos.css" rel="stylesheet" />
    <link
      href="assets/vendor/bootstrap/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <link
      href="assets/vendor/bootstrap-icons/bootstrap-icons.css"
      rel="stylesheet"
    />
    <link href="assets/vendor/boxicons/css/boxicons.min.css" rel="stylesheet" />
    <link href="assets/vendor/fontawesome/css/all.min.css" rel="stylesheet" />
    <link
      href="assets/vendor/glightbox/css/glightbox.min.css"
      rel="stylesheet"
    />
    <link href="assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet" />

    <!-- Template Main CSS File -->
    <link href="assets/css/style.css" rel="stylesheet" />
  </head>

  <body>
    <!-- ======= Mode section ======= -->
    <div id="mode" class="mode" style="display: none">
      <!-- display: none -> disable div -->
      <input type="checkbox" id="mode-toggle" class="mode-toggle" />
      <label id="toggle-label" for="mode-toggle" class="toggle-label">
        <svg
          class="moon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M3.39703 11.6315C3.39703 16.602 7.42647 20.6315 12.397 20.6315C15.6858 20.6315 18.5656 18.8664 20.1358 16.23C16.7285 17.3289 12.6922 16.7548 9.98282 14.0455C7.25201 11.3146 6.72603 7.28415 7.86703 3.89293C5.20697 5.47927 3.39703 8.38932 3.39703 11.6315ZM21.187 13.5851C22.0125 13.1021 23.255 13.6488 23 14.5706C21.7144 19.2187 17.4543 22.6315 12.397 22.6315C6.3219 22.6315 1.39703 17.7066 1.39703 11.6315C1.39703 6.58874 4.93533 2.25845 9.61528 0.999986C10.5393 0.751502 11.0645 1.99378 10.5641 2.80935C8.70026 5.84656 8.83194 10.0661 11.397 12.6312C13.9319 15.1662 18.1365 15.3702 21.187 13.5851Z"
              fill="#0F0F0F"
            ></path>
          </g>
        </svg>
        <svg
          class="sun"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V4C12.75 4.41421 12.4142 4.75 12 4.75C11.5858 4.75 11.25 4.41421 11.25 4V2C11.25 1.58579 11.5858 1.25 12 1.25ZM3.66865 3.71609C3.94815 3.41039 4.42255 3.38915 4.72825 3.66865L6.95026 5.70024C7.25596 5.97974 7.2772 6.45413 6.9977 6.75983C6.7182 7.06553 6.2438 7.08677 5.9381 6.80727L3.71609 4.77569C3.41039 4.49619 3.38915 4.02179 3.66865 3.71609ZM20.3314 3.71609C20.6109 4.02179 20.5896 4.49619 20.2839 4.77569L18.0619 6.80727C17.7562 7.08677 17.2818 7.06553 17.0023 6.75983C16.7228 6.45413 16.744 5.97974 17.0497 5.70024L19.2718 3.66865C19.5775 3.38915 20.0518 3.41039 20.3314 3.71609ZM12 7.75C9.65279 7.75 7.75 9.65279 7.75 12C7.75 14.3472 9.65279 16.25 12 16.25C14.3472 16.25 16.25 14.3472 16.25 12C16.25 9.65279 14.3472 7.75 12 7.75ZM6.25 12C6.25 8.82436 8.82436 6.25 12 6.25C15.1756 6.25 17.75 8.82436 17.75 12C17.75 15.1756 15.1756 17.75 12 17.75C8.82436 17.75 6.25 15.1756 6.25 12ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H4C4.41421 11.25 4.75 11.5858 4.75 12C4.75 12.4142 4.41421 12.75 4 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM19.25 12C19.25 11.5858 19.5858 11.25 20 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H20C19.5858 12.75 19.25 12.4142 19.25 12ZM17.0255 17.0252C17.3184 16.7323 17.7933 16.7323 18.0862 17.0252L20.3082 19.2475C20.6011 19.5404 20.601 20.0153 20.3081 20.3082C20.0152 20.6011 19.5403 20.601 19.2475 20.3081L17.0255 18.0858C16.7326 17.7929 16.7326 17.3181 17.0255 17.0252ZM6.97467 17.0253C7.26756 17.3182 7.26756 17.7931 6.97467 18.086L4.75244 20.3082C4.45955 20.6011 3.98468 20.6011 3.69178 20.3082C3.39889 20.0153 3.39889 19.5404 3.69178 19.2476L5.91401 17.0253C6.2069 16.7324 6.68177 16.7324 6.97467 17.0253ZM12 19.25C12.4142 19.25 12.75 19.5858 12.75 20V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V20C11.25 19.5858 11.5858 19.25 12 19.25Z"
              fill="#ffffff"
            ></path>
          </g>
        </svg>
      </label>
    </div>
    <!-- End Mode -->

    <!-- ======= Mobile nav toggle button ======= -->
    <!-- <button type="button" class="mobile-nav-toggle d-xl-none"><i class="bi bi-list mobile-nav-toggle"></i></button> -->
    <i class="bi bi-list mobile-nav-toggle d-lg-none"></i>
    <!-- ======= Header ======= -->
    <header id="header" class="d-flex flex-column justify-content-center">
      <nav id="navbar" class="navbar nav-menu">
        <ul>
          <li>
            <a href="#hero" class="nav-link scrollto active"
              ><i class="bx bx-home"></i> <span>Home</span></a
            >
          </li>
          <li>
            <a href="#about" class="nav-link scrollto"
              ><i class="bx bx-user"></i> <span>About</span></a
            >
          </li>
          <li>
            <a href="#resume" class="nav-link scrollto"
              ><i class="bx bx-file-blank"></i> <span>Resume</span></a
            >
          </li>
          <li>
            <a href="#portfolio" class="nav-link scrollto"
              ><i class="bx bx-book-content"></i> <span>Portfolio</span></a
            >
          </li>
          <li>
            <a href="#publications" class="nav-link scrollto"
              ><i class="bx bx-book"></i><span>Publications</span></a
            >
          </li>
          <li>
            <a href="#contact" class="nav-link scrollto"
              ><i class="bx bx-envelope"></i> <span>Contact</span></a
            >
          </li>
        </ul>
      </nav>
      <!-- .nav-menu -->
    </header>
    <!-- End Header -->

    <!-- ======= Hero Section ======= -->
    <section id="hero" class="d-flex flex-column justify-content-center">
      <div class="container" data-aos="zoom-in" data-aos-delay="100">
        <h1>Jonathan Tobias da Silva</h1>
        <p>
          I'm
          <span
            class="typed"
            data-typed-items="a Research and Development Engineer, an Embedded Software Engineer, a Propagator of Cybersecurity and Artificial Intelligence, an Open Source Enthusiast, a Lover in Learning new Technologies"
          ></span>
        </p>
        <div class="social-links">
          <a href="https://www.linkedin.com/in/jonathantsilva/" class="linkedin"
            ><i class="fa-brands fa-linkedin-in fa-sm"></i
          ></a>
          <a href="https://www.github.com/JonathanTSilva" class="github"
            ><i class="fa-brands fa-github fa-sm"></i
          ></a>
          <a href="https://orcid.org/0000-0002-2511-259X" class="orcid"
            ><i class="fa-brands fa-orcid fa-sm"></i
          ></a>
          <a
            href="mailto:jonathantosilva@hotmail.com"
            target="_blank"
            class="mail"
            ><i class="fa fa-envelope fa-sm"></i
          ></a>
        </div>
        <div class="download-cv">
          <a href="assets/files/Resume-JonathanTSilva-2025.08.en.pdf" download>
            <button type="submit">Download Resume</button>
          </a>
        </div>
      </div>
    </section>
    <!-- End Hero -->

    <main id="main">
      <!-- ======= About Section ======= -->
      <section id="about" class="about">
        <div class="container" data-aos="fade-up">
          <div class="section-title">
            <h2>About</h2>
            <p>
              I solve complex problems by engineering impactful solutions. As a Research and Development
              Engineer specializing in software and embedded systems, my work is at the intersection of
              operational and information technology. I am dedicated to applying expertise in AI, cybersecurity,
              and advanced software engineering to tackle the toughest challenges and create meaningful progress.
            </p>
          </div>

          <div class="row">
            <div class="col-lg-4">
              <img
                id="profile"
                src="assets/img/profile-img.jpg"
                class="img-fluid"
                alt=""
              />
            </div>
            <div class="col-lg-8 pt-4 pt-lg-0 content">
              <h3>Research &amp; Development Engineer</h3>
              <p class="fst-italic">
                My career is built on over years of hands-on experience in the R&amp;D department,
                where I've honed my skills in problem-solving and the development of firmware and
                embedded software. This practical foundation is complemented by my academic
                background, which includes a Master's degree in Electrical and Computer Engineering
                from the University of São Paulo (USP), a Bachelor's degree in Electrical Engineering
                from the Federal Institute of São Paulo (IFSP) and a Technical degree in Administration from the
                State Technical School (ETEC).
              </p>
              <div class="row">
                <div class="col-lg-6">
                  <ul>
                    <li>
                      <i class="bi bi-chevron-right"></i>
                      <strong>Website:</strong>
                      <span>www.jontobias.com</span>
                    </li>
                    <li>
                      <i class="bi bi-chevron-right"></i>
                      <strong>Phone:</strong>
                      <span>+5516993232745</span>
                    </li>
                    <li>
                      <i class="bi bi-chevron-right"></i> <strong>City:</strong>
                      <span>Brazil</span>
                    </li>
                  </ul>
                </div>
                <div class="col-lg-6">
                  <ul>
                    <li>
                      <i class="bi bi-chevron-right"></i>
                      <strong>Degree:</strong>
                      <span>Master of Sciences (M.Sc.)</span>
                    </li>
                    <li>
                      <i class="bi bi-chevron-right"></i>
                      <strong>University:</strong>
                      <span>University of São Paulo (USP)</span>
                    </li>
                    <li>
                      <i class="bi bi-chevron-right"></i>
                      <strong>Email:</strong>
                      <span>jonathantosilva@hotmail.com</span>
                    </li>
                  </ul>
                </div>
              </div>
              <p>
                The thirst for knowledge, experience, and the current
                technological landscape drive me to exhibit a high level of
                adaptability to new environments and insights, seeking to apply
                them to the challenges stemming from the understanding of
                reality and all its direct or indirect aspects, to improve the
                world we live in.
              </p>
            </div>
          </div>
        </div>
      </section>
      <!-- End About Section -->

      <!-- ======= Facts Section ======= -->
      <section id="facts" class="facts">
        <div class="container" data-aos="fade-up">
          <div class="section-title">
            <h2>Facts</h2>
            <p>
              Numbers weave the fabric of professional triumphs. Each figure
              tells a story of dedication, expertise, and the journey to
              success. Explore the metrics that define my narrative, revealing
              the depth of experience and commitment.
            </p>
          </div>

          <div class="row">
            <div class="col-lg-3 col-md-6">
              <div class="count-box">
                <i class="bi bi-award"></i>
                <span
                  data-purecounter-start="0"
                  data-purecounter-end="9"
                  data-purecounter-duration="1"
                  class="purecounter"
                ></span
                ><span>.3</span>
                <h1>/</h1>
                <span>10</span>
                <!-- <span>9.3/10</span> -->
                <p>Highest GPA</p>
              </div>
            </div>

            <div class="col-lg-3 col-md-6 mt-5 mt-md-0">
              <div class="count-box">
                <i class="bi bi-briefcase"></i>
                <span
                  data-purecounter-start="0"
                  data-purecounter-end="4"
                  data-purecounter-duration="1"
                  class="purecounter"
                ></span>
                <h1>+</h1>
                <p>Years of Experience</p>
              </div>
            </div>

            <div class="col-lg-3 col-md-6 mt-5 mt-lg-0">
              <div class="count-box">
                <i class="bi bi-journal-richtext"></i>
                <span
                  data-purecounter-start="0"
                  data-purecounter-end="20"
                  data-purecounter-duration="1"
                  class="purecounter"
                ></span>
                <h1>+</h1>
                <!-- <span>20+</span> -->
                <p>Projects</p>
              </div>
            </div>

            <div class="col-lg-3 col-md-6 mt-5 mt-lg-0">
              <div class="count-box">
                <i class="bx bx-check-shield"></i>
                <span
                  data-purecounter-start="0"
                  data-purecounter-end="25"
                  data-purecounter-duration="1"
                  class="purecounter"
                ></span>
                <h1>+</h1>
                <p>Licenses &amp; Certifications</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- End Facts Section -->

      <!-- ======= Skills Section ======= -->
      <section id="skills" class="skills section-bg">
        <div class="container" data-aos="fade-up">
          <div class="section-title">
            <h2>Skills</h2>
          </div>

          <div class="row">
            <div
              class="col-lg-12 d-flex justify-content-center"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <ul id="skills-filters">
                <li data-filter="*" class="filter-active">All</li>
                <li data-filter=".filter-soft">Soft</li>
                <li data-filter=".filter-hard">Hard</li>
                <li data-filter=".filter-languages">Languages</li>
              </ul>
            </div>
          </div>

          <div
            class="row skills-container"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div class="container-sizer"></div>
            <label class="skills-item filter-hard --w3"
              >Research and Development (R&amp;D)</label
            >
            <label class="skills-item filter-hard filter-languages --w1"
              >Python</label
            >
            <label class="skills-item filter-hard filter-languages --w0-75"
              >C++</label
            >
            <label class="skills-item filter-hard filter-languages --w0-75"
              >Java</label
            >
            <label class="skills-item filter-hard filter-languages --w0-5"
              >C</label
            >
            <label class="skills-item filter-hard filter-languages --w1-25"
              >Embedded C</label
            >
            <label class="skills-item filter-hard filter-languages --w1-5"
              >Embedded Linux</label
            >
            <label class="skills-item filter-hard filter-languages --w1-25"
              >UNIX/Linux</label
            >
            <label class="skills-item filter-hard filter-languages --w0-75"
              >Bash</label
            >
            <label class="skills-item filter-hard filter-languages --w0-5"
              >Git</label
            >
            <label class="skills-item filter-hard --w1-5">Yocto Project</label>
            <label class="skills-item filter-hard --w2"
              >Computer Networks</label
            >
            <label class="skills-item filter-hard --w1-75"
              >Cloud Computing</label
            >
            <label class="skills-item filter-hard --w2"
              >Software Engineering</label
            >
            <label class="skills-item filter-hard --w2-25"
              >Software Development</label
            >
            <label class="skills-item filter-hard --w1-75"
              >Test Management</label
            >
            <label class="skills-item filter-hard --w1-5">Cybersecurity</label>
            <label class="skills-item filter-hard --w1-75"
              >Quality Assurance</label
            >
            <label class="skills-item filter-hard --w2-25"
              >Artificial Intelligence</label
            >
            <label class="skills-item filter-hard --w1-75"
              >Machine Learning</label
            >
            <label class="skills-item filter-hard --w1-5">Generative AI</label>
            <label class="skills-item filter-hard --w2-5"
              >Communication Protocols</label
            >
            <label class="skills-item filter-soft --w1-25">Adaptability</label>
            <label class="skills-item filter-soft --w1-25">Leadership</label>
            <label class="skills-item filter-soft --w2"
              >Conflict Resolution</label
            >
            <label class="skills-item filter-soft --w1-5">Collaboration</label>
            <label class="skills-item filter-soft --w2"
              >Project Management</label
            >
            <label class="skills-item filter-soft --w1-5">Communication</label>
            <label class="skills-item filter-soft --w1-25">Presentation</label>
            <label class="skills-item filter-soft --w1-75"
              >Creative Thinking</label
            >
            <label class="skills-item filter-soft --w1-75"
              >Problem-Solving</label
            >
            <label class="skills-item filter-soft --w1-75"
              >Deadline-Oriented</label
            >
            <label class="skills-item filter-hard filter-languages --w0-75"
              >Latex</label
            >
            <label class="skills-item filter-hard filter-languages --w1"
              >Docker</label
            >
            <label class="skills-item filter-hard --w1-75"
              >Embedded Systems</label
            >
          </div>
        </div>
      </section>
      <!-- End Skills Section -->

      <!-- ======= Skills Section ======= -->
      <!-- <section id="skills" class="skills section-bg">
            <div class="container" data-aos="fade-up">

                <div class="section-title">
                    <h2>Skills</h2>
                    <p>Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex aliquid fuga eum quidem. Sit
                        sint consectetur velit. Quisquam quos quisquam cupiditate. Et nemo qui impedit suscipit alias
                        ea. Quia fugiat sit in iste officiis commodi quidem hic quas.</p>
                </div>

                <div class="row skills-content">

                    <div class="col-lg-6">

                        <div class="progress">
                            <span class="skill">HTML <i class="val">100%</i></span>
                            <div class="progress-bar-wrap">
                                <div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0"
                                    aria-valuemax="100"></div>
                            </div>
                        </div>

                        <div class="progress">
                            <span class="skill">CSS <i class="val">90%</i></span>
                            <div class="progress-bar-wrap">
                                <div class="progress-bar" role="progressbar" aria-valuenow="90" aria-valuemin="0"
                                    aria-valuemax="100"></div>
                            </div>
                        </div>

                        <div class="progress">
                            <span class="skill">JavaScript <i class="val">75%</i></span>
                            <div class="progress-bar-wrap">
                                <div class="progress-bar" role="progressbar" aria-valuenow="75" aria-valuemin="0"
                                    aria-valuemax="100"></div>
                            </div>
                        </div>

                    </div>

                    <div class="col-lg-6">

                        <div class="progress">
                            <span class="skill">PHP <i class="val">80%</i></span>
                            <div class="progress-bar-wrap">
                                <div class="progress-bar" role="progressbar" aria-valuenow="80" aria-valuemin="0"
                                    aria-valuemax="100"></div>
                            </div>
                        </div>

                        <div class="progress">
                            <span class="skill">WordPress/CMS <i class="val">90%</i></span>
                            <div class="progress-bar-wrap">
                                <div class="progress-bar" role="progressbar" aria-valuenow="90" aria-valuemin="0"
                                    aria-valuemax="100"></div>
                            </div>
                        </div>

                        <div class="progress">
                            <span class="skill">Photoshop <i class="val">55%</i></span>
                            <div class="progress-bar-wrap">
                                <div class="progress-bar" role="progressbar" aria-valuenow="55" aria-valuemin="0"
                                    aria-valuemax="100"></div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </section>End Skills Section -->

      <!-- ======= Resume Section ======= -->
      <section id="resume" class="resume">
        <div class="container" data-aos="fade-up">
          <div class="section-title">
            <h2>Resume</h2>
            <!-- <p>Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex aliquid fuga eum quidem. Sit
                        sint consectetur velit. Quisquam quos quisquam cupiditate. Et nemo qui impedit suscipit alias
                        ea. Quia fugiat sit in iste officiis commodi quidem hic quas.</p> -->
          </div>

          <div class="row">
            <div class="col-lg-6">
              <h3 class="resume-title">Professional Experience</h3>
              <div class="resume-item">
                <h4>Embedded Software Engineer</h4>
                <h5>2024 - Ongoing</h5>
                <p><em>Datacom, Eldorado do Sul, RS</em></p>
                <ul>
                  <li>
                    Develop and maintain C/C++ and Python software, optimizing
                    device performance and ensuring high reliability.
                  </li>
                  <li>
                    Enhance code reliability through the design and execution of
                    unit tests and automated integration tests using GoogleTest
                    and the Robot Framework.
                  </li>
                  <li>
                    Develop and debug embedded Linux systems, with a focus on
                    performance tuning and system stability across various
                    hardware platforms.
                  </li>
                  <li>
                    Implement and maintain protocols at the Layer 3 level.
                  </li>
                  <li>
                    Conduct code reviews following best practices in TDD, CI/CD,
                    and Clean Code principles.
                  </li>
                  <li>
                    Conduct in-depth troubleshooting on complex
                    telecommunications systems, resolving critical issues, and
                    minimizing system downtime.
                  </li>
                </ul>
              </div>

              <div class="resume-item">
                <h4>R&amp;D Engineer</h4>
                <h5>2024 - 2024</h5>
                <p><em>Nova Smar, Sertãozinho, SP</em></p>
                <!-- <p>As a member of the Software and Systems team in the Research and Development (R&D) department 
                                of Nova Smar S/A - a Brazilian multinational pioneer in Fieldbus and a leader in the industrial 
                                automation market - I am involved in project management of software and the development, 
                                maintenance, and quality assurance of System302 and other tools and applications associated with it. 
                                This experience encompasses significant achievements and activities, including:</p> -->
                <ul>
                  <li>
                    Coordinate a product development initiative, managing a team
                    of 10 engineers and developers to deliver high-quality
                    embedded software solutions.
                  </li>
                  <li>
                    Apply cybersecurity measures to ensure compliance with IEC
                    62443 and O-PAS standards, enhancing the security and
                    integrity of embedded systems.
                  </li>
                  <li>
                    Orchestrate the migration of version control systems from
                    CVS to Git for the R&D department, implementing CI/CD
                    pipelines to streamline project workflows.
                  </li>
                  <li>
                    Lead the development and maintenance of Linux operating
                    systems and kernels using the Yocto Project for real-time
                    operating systems (RTOS).
                  </li>
                  <li>
                    Develop desktop and embedded software applications and
                    internal tools to optimize workflows, using Python, Java,
                    C/C++, and Bash/Powershell.
                  </li>
                  <li>
                    Experience with hardware interfaces, networking protocols,
                    and communication standards.
                  </li>
                </ul>
              </div>
              <div class="resume-item">
                <h4>Junior R&amp;D Engineer</h4>
                <h5>2022 - 2023</h5>
                <p><em>Nova Smar, Sertãozinho, SP</em></p>
                <!-- <p>As a member of the Software and Systems team in the Research and Development (R&D) department 
                                of Nova Smar S/A - a Brazilian multinational pioneer in Fieldbus and a leader in the industrial 
                                automation market - I am involved in project management of software and the development, 
                                maintenance, and quality assurance of System302 and other tools and applications associated with it. 
                                This experience encompasses significant achievements and activities, including:</p> -->
                <ul>
                  <li>
                    Conduct research in the areas of Cybersecurity and
                    Artificial Intelligence, with a focus on applicability in
                    the automation and control industry. Project proposals
                    accepted through solid proof of concepts have enhanced
                    system security and saved time in internal processes by
                    implementing machine learning tools.
                  </li>
                  <li>
                    Developing desktop (Windows) and embedded Linux applications
                    for System302, as well as internal tools to optimize
                    workflows, using Python, Java, C/C++ (Embedded), and
                    Bash/Powershell.
                  </li>
                  <li>
                    Comprehensive application of Software Engineering and
                    Computer Network concepts in development processes, such as
                    version control (Git); Clean Code and Clean Architecture;
                    software testing and debugging; virtualization,
                    containerization, and orchestration; continuous integration
                    and deployment (CI/CD); and communication protocols.
                  </li>
                  <li>
                    Member of the internal System302 project team, overseeing
                    deliveries, milestones, and issues. Coordinating the
                    system's quality assurance process by creating test plans
                    and cases, along with setting priorities.
                  </li>
                  <li>
                    Writing technical documentation in English and Portuguese.
                  </li>
                  <li>
                    Developing and conducting internal training sessions,
                    ensuring the effective dissemination of knowledge.
                  </li>
                </ul>
              </div>
              <div class="resume-item">
                <h4>R&amp;D Intern</h4>
                <h5>2021</h5>
                <p><em>Nova Smar, Sertãozinho, SP</em></p>
                <!-- <p>Broad involvement in various topics within the Software and Systems team of the Electronic Development department (R&D), 
                                based on providing practical knowledge for understanding and resolving complexities in the 
                                professional context, supported by an investigative stance. Key contributions stand out in:</p> -->
                <ul>
                  <li>
                    Conducting research in the field of industrial automation
                    and software engineering, resulting in the approval of a new
                    project through a proof of concept.
                  </li>
                  <li>
                    Developing new internal tools for the R&D department,
                    accompanied by the creation of their respective technical
                    documentation, as well as maintaining existing code to
                    ensure operational efficiency.
                  </li>
                  <li>
                    Creating test plans and cases and effectively coordinating
                    the execution of corresponding tests.
                  </li>
                  <li>
                    Providing specialized technical support in the Distributed
                    Control System - System302.
                  </li>
                </ul>
              </div>
            </div>
            <div class="col-lg-6">
              <!-- <h3 class="resume-title">Sumary</h3>
            <div class="resume-item pb-0">
              <h4>Jonathan Tobias da Silva</h4>
              <p><em>Research and development engineer with 3+ years of experience in the field
                  of software engineering and embedded systems applied in operational (OT) and
                  information
                  technology (IT) domains.</em></p>
              <ul>
                <li>São Paulo, Brazil</li>
                <li>+55 (16) 993232745</li>
                <li>jonathantosilva@hotmail.com</li>
              </ul>
            </div> -->

              <h3 class="resume-title">Education</h3>
              <div class="resume-item">
                <h4>M.Sc. in Electrical Engineering</h4>
                <h5>2022 - 2025</h5>
                <p>
                  <em>University of São Paulo (EESC-USP), São Carlos, SP</em>
                </p>
                <p>
                  Conducted a vulnerability analysis of industrial OPC UA
                  networks through a testbed simulating cyberattacks (packet
                  sniffing, MITM, DoS). Demonstrated network resilience and
                  provided actionable recommendations for enhancing OPC UA
                  security and protecting Industrial Automation and Control
                  Systems.
                </p>
              </div>
              <div class="resume-item">
                <h4>B.Sc. in Electrical Engineering</h4>
                <h5>2017 - 2021</h5>
                <p>
                  <em
                    >Federal Institute of São Paulo (IFSP), Sertãozinho, SP</em
                  >
                </p>
                <p>
                  Degree completed with emphasis on computer science, industrial
                  automation, and power systems. Various extension projects and
                  scientific initiation were undertaken within the scope of the
                  four pillars: digitization, industrial automation, software
                  engineering, and artificial intelligence.
                </p>
              </div>
              <div class="resume-item">
                <h4>Certificate in Administration</h4>
                <h5>2014 - 2016</h5>
                <p>
                  <em>Technical School of São Paulo (ETEC), Batatais, SP</em>
                </p>
                <p>
                  Foundational technical knowledge acquired during high school,
                  providing the necessary expertise for business and people
                  management. Enhancement and honing of soft skills related to
                  communication, public speaking, and leadership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- End Resume Section -->

      <!-- ======= Portfolio Section ======= -->
      <section id="portfolio" class="portfolio section-bg">
        <!-- display: none -> disable div -->
        <div class="container" data-aos="fade-up">
          <div class="section-title">
            <h2>Portfolio</h2>
            <p>
              Delve into a portfolio that encapsulates a spectrum of projects,
              each a testament to innovation and proficiency. While the public
              domain showcases select endeavors, a significant portion remains
              guarded as exclusive private projects. For an in-depth
              understanding and details on both the public and undisclosed
              ventures, feel free to
              <a href="#contact"><span>get in touch</span></a
              >.
            </p>
          </div>

          <div class="row">
            <div
              class="col-lg-12 d-flex justify-content-center"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <ul id="portfolio-filters">
                <li data-filter="*" class="filter-active">All</li>
                <li data-filter=".filter-embedded">Embedded</li>
                <li data-filter=".filter-desktop">Desktop</li>
                <li data-filter=".filter-web">Web</li>
                <li data-filter=".filter-android">Android</li>
                <li data-filter=".filter-open">Open-Source</li>
              </ul>
            </div>
          </div>

          <div
            class="row portfolio-container"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div
              class="col-lg-4 col-md-6 portfolio-item filter-web filter-open"
            >
              <div class="portfolio-wrap">
                <img
                  src="assets/img/portfolio/sizer-00.2.png"
                  class="img-fluid"
                  alt=""
                />
                <div class="portfolio-info">
                  <h4>Sizer</h4>
                  <p>Web</p>
                  <div class="portfolio-links">
                    <a
                      href="assets/img/portfolio/sizer-00.1.jpeg"
                      data-gallery="portfolioGallery"
                      class="portfolio-lightbox"
                      title="Sizer"
                      ><i class="bx bx-plus"></i
                    ></a>
                    <a
                      href="assets/pages/sizer.html"
                      class="portfolio-details-lightbox"
                      data-glightbox="type: external"
                      title="Portfolio Details"
                      ><i class="bx bx-link"></i
                    ></a>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="col-lg-4 col-md-6 portfolio-item filter-android filter-open"
            >
              <div class="portfolio-wrap">
                <img
                  src="assets/img/portfolio/dimfot-00.2.png"
                  class="img-fluid"
                  alt=""
                />
                <div class="portfolio-info">
                  <h4>Dimfot</h4>
                  <p>Android</p>
                  <div class="portfolio-links">
                    <a
                      href="assets/img/portfolio/dimfot-00.1.jpeg"
                      data-gallery="portfolioGallery"
                      class="portfolio-lightbox"
                      title="Dimfot"
                      ><i class="bx bx-plus"></i
                    ></a>
                    <a
                      href="assets/pages/dimfot.html"
                      class="portfolio-details-lightbox"
                      data-glightbox="type: external"
                      title="Portfolio Details"
                      ><i class="bx bx-link"></i
                    ></a>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-4 col-md-6 portfolio-item filter-open">
              <div class="portfolio-wrap">
                <img
                  src="assets/img/portfolio/latex-ifsp-00.2.png"
                  class="img-fluid"
                  alt=""
                />
                <div class="portfolio-info">
                  <h4>Official Templates - IFSP-SRT</h4>
                  <p>LaTeX</p>
                  <div class="portfolio-links">
                    <a
                      href="assets/img/portfolio/latex-ifsp-00.1.png"
                      data-gallery="portfolioGallery"
                      class="portfolio-lightbox"
                      title="Official Templates"
                      ><i class="bx bx-plus"></i
                    ></a>
                    <a
                      href="assets/pages/latex-ifsp.html"
                      class="portfolio-details-lightbox"
                      data-glightbox="type: external"
                      title="Portfolio Details"
                      ><i class="bx bx-link"></i
                    ></a>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="col-lg-4 col-md-6 portfolio-item filter-desktop filter-open"
            >
              <div class="portfolio-wrap">
                <img
                  src="assets/img/portfolio/sentminer-00.2.png"
                  class="img-fluid"
                  alt=""
                />
                <div class="portfolio-info">
                  <h4>Sentminer</h4>
                  <p>Anki Add-ons</p>
                  <div class="portfolio-links">
                    <a
                      href="assets/img/portfolio/sentminer-00.1.jpeg"
                      data-gallery="portfolioGallery"
                      class="portfolio-lightbox"
                      title="Sentminer"
                      ><i class="bx bx-plus"></i
                    ></a>
                    <a
                      href="assets/pages/sentminer.html"
                      class="portfolio-details-lightbox"
                      data-glightbox="type: external"
                      title="Portfolio Details"
                      ><i class="bx bx-link"></i
                    ></a>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-4 col-md-6 portfolio-item filter-embedded">
              <div class="portfolio-wrap">
                <img
                  src="assets/img/portfolio/on-board-00.2.png"
                  class="img-fluid"
                  alt=""
                />
                <div class="portfolio-info">
                  <h4>On-board computer</h4>
                  <p>Embedded</p>
                  <div class="portfolio-links">
                    <a
                      href="assets/img/portfolio/on-board-00.1.png"
                      data-gallery="portfolioGallery"
                      class="portfolio-lightbox"
                      title="On-board computer"
                      ><i class="bx bx-plus"></i
                    ></a>
                    <a
                      href="assets/pages/on-board.html"
                      class="portfolio-details-lightbox"
                      data-glightbox="type: external"
                      title="Portfolio Details"
                      ><i class="bx bx-link"></i
                    ></a>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="col-lg-4 col-md-6 portfolio-item filter-embedded filter-desktop"
            >
              <div class="portfolio-wrap">
                <img
                  src="assets/img/portfolio/block-firmware-00.2.png"
                  class="img-fluid"
                  alt=""
                />
                <div class="portfolio-info">
                  <h4>IEC 61131 Function Block</h4>
                  <p>Embedded &amp; Desktop</p>
                  <div class="portfolio-links">
                    <a
                      href="assets/img/portfolio/block-firmware-00.1.jpeg"
                      data-gallery="portfolioGallery"
                      class="portfolio-lightbox"
                      title="IEC 61131 Function Block"
                      ><i class="bx bx-plus"></i
                    ></a>
                    <a
                      href="assets/pages/block-firmware.html"
                      class="portfolio-details-lightbox"
                      data-glightbox="type: external"
                      title="Portfolio Details"
                      ><i class="bx bx-link"></i
                    ></a>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="col-lg-4 col-md-6 portfolio-item filter-web filter-open"
            >
              <div class="portfolio-wrap">
                <img
                  src="assets/img/portfolio/cloud-detection-00.2.png"
                  class="img-fluid"
                  alt=""
                />
                <div class="portfolio-info">
                  <h4>Cloud failure detection</h4>
                  <p>Web</p>
                  <div class="portfolio-links">
                    <a
                      href="assets/img/portfolio/cloud-detection-00.1.jpeg"
                      data-gallery="portfolioGallery"
                      class="portfolio-lightbox"
                      title="Cloud failure detection"
                      ><i class="bx bx-plus"></i
                    ></a>
                    <a
                      href="assets/pages/cloud-detection.html"
                      class="portfolio-details-lightbox"
                      data-glightbox="type: external"
                      title="Portfolio Details"
                      ><i class="bx bx-link"></i
                    ></a>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="col-lg-4 col-md-6 portfolio-item filter-desktop filter-open"
            >
              <div class="portfolio-wrap">
                <img
                  src="assets/img/portfolio/cavitation-00.2.png"
                  class="img-fluid"
                  alt=""
                />
                <div class="portfolio-info">
                  <h4>Pump Diagnostic System</h4>
                  <p>Desktop</p>
                  <div class="portfolio-links">
                    <a
                      href="assets/img/portfolio/cavitation-00.1.jpeg"
                      data-gallery="portfolioGallery"
                      class="portfolio-lightbox"
                      title="Pump Diagnostic System"
                      ><i class="bx bx-plus"></i
                    ></a>
                    <a
                      href="assets/pages/cavitation.html"
                      class="portfolio-details-lightbox"
                      data-glightbox="type: external"
                      title="Portfolio Details"
                      ><i class="bx bx-link"></i
                    ></a>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="col-lg-4 col-md-6 portfolio-item filter-embedded filter-open"
            >
              <div class="portfolio-wrap">
                <img
                  src="assets/img/portfolio/embedded-linux-00.3.png"
                  class="img-fluid"
                  alt=""
                />
                <div class="portfolio-info">
                  <h4>Embedded Linux and Kernel</h4>
                  <p>Embedded</p>
                  <div class="portfolio-links">
                    <a
                      href="assets/img/portfolio/embedded-linux-00.1.jpeg"
                      data-gallery="portfolioGallery"
                      class="portfolio-lightbox"
                      title="Embedded Linux and Kernel"
                      ><i class="bx bx-plus"></i
                    ></a>
                    <a
                      href="assets/pages/embedded-linux.html"
                      class="portfolio-details-lightbox"
                      data-glightbox="type: external"
                      title="Portfolio Details"
                      ><i class="bx bx-link"></i
                    ></a>
                  </div>
                </div>
              </div>
            </div>

            <!-- 
          <div class="col-lg-4 col-md-6 portfolio-item filter-web">
            <div class="portfolio-wrap">
              <img src="assets/img/portfolio/portfolio-9.jpg" class="img-fluid" alt="">
              <div class="portfolio-info">
                <h4>Web 3</h4>
                <p>Web</p>
                <div class="portfolio-links">
                  <a href="assets/img/portfolio/portfolio-9.jpg" data-gallery="portfolioGallery"
                    class="portfolio-lightbox" title="Web 3"><i class="bx bx-plus"></i></a>
                  <a href="assets/pages/portfolio-details.html" class="portfolio-details-lightbox" data-glightbox="type: external"
                    title="Portfolio Details"><i class="bx bx-link"></i></a>
                </div>
              </div>
            </div>
          </div> -->
          </div>
        </div>
      </section>
      <!-- End Portfolio Section -->

      <!-- ======= Publications Section ======= -->
      <section id="publications" class="publications">
        <div class="container" data-aos="fade-up">
          <div class="section-title">
            <h2>Publications</h2>
            <p>
              Explore a collection with the most relevant publications
              reflecting expertise in industrial digitalization, software
              engineering, and the integration of operational and information
              technology. Explore key insights in cybersecurity and artificial
              intelligence within the realm of technology integration.
            </p>
          </div>

          <div class="row">
            <div
              class="col-lg-4 col-md-6 d-flex align-items-stretch"
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              <div class="icon-box iconbox-blue">
                <a href="https://ieeexplore.ieee.org/document/9529678">
                  <div class="icon">
                    <svg
                      width="100"
                      height="100"
                      viewBox="0 0 600 600"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke="none"
                        stroke-width="0"
                        fill="#f5f5f5"
                        d="M300,521.0016835830174C376.1290562159157,517.8887921683347,466.0731472004068,529.7835943286574,510.70327084640275,468.03025145048787C554.3714126377745,407.6079735673963,508.03601936045806,328.9844924480964,491.2728898941984,256.3432110539036C474.5976632858925,184.082847569629,479.9380746630129,96.60480741107993,416.23090153303,58.64404602377083C348.86323505073057,18.502131276798302,261.93793281208167,40.57373210992963,193.5410806939664,78.93577620505333C130.42746243093433,114.334589627462,98.30271207620316,179.96522072025542,76.75703585869454,249.04625023123273C51.97151888228291,328.5150500222984,13.704378332031375,421.85034740162234,66.52175969318436,486.19268352777647C119.04800174914682,550.1803526380478,217.28368757567262,524.383925680826,300,521.0016835830174"
                      ></path>
                    </svg>
                    <i class="fa-regular fa-pump"></i>
                  </div>
                </a>
                <p>
                  An intelligent fault diagnosis for centrifugal pumps based on
                  electric current information.
                </p>
              </div>
            </div>

            <div
              class="col-lg-4 col-md-6 d-flex align-items-stretch mt-4 mt-md-0"
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              <div class="icon-box iconbox-orange">
                <a href="https://ieeexplore.ieee.org/document/10375053">
                  <div class="icon">
                    <svg
                      width="100"
                      height="100"
                      viewBox="0 0 600 600"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke="none"
                        stroke-width="0"
                        fill="#f5f5f5"
                        d="M300,582.0697525312426C382.5290701553225,586.8405444964366,449.9789794690241,525.3245884688669,502.5850820975895,461.55621195738473C556.606425686781,396.0723002908107,615.8543463187945,314.28637112970534,586.6730223649479,234.56875336149918C558.9533121215079,158.8439757836574,454.9685369536778,164.00468322053177,381.49747125262974,130.76875717737553C312.15926192815925,99.40240125094834,248.97055460311594,18.661163978235184,179.8680185752513,50.54337015887873C110.5421016452524,82.52863877960104,119.82277516462835,180.83849132639028,109.12597500060166,256.43424936330496C100.08760227029461,320.3096726198365,92.17705696193138,384.0621239912766,124.79988738764834,439.7174275375508C164.83382741302287,508.01625554203684,220.96474134820875,577.5009287672846,300,582.0697525312426"
                      ></path>
                    </svg>
                    <i class="fa-regular fa-network-wired"></i>
                  </div>
                </a>
                <p>
                  A Survey on OPC UA protocol: overview, challenges and
                  opportunities.
                </p>
              </div>
            </div>

            <div
              class="col-lg-4 col-md-6 d-flex align-items-stretch mt-4 mt-lg-0"
              data-aos="zoom-in"
              data-aos-delay="300"
            >
              <div class="icon-box iconbox-pink">
                <a
                  href="http://ocs.ifsp.edu.br/index.php/conict/xconict/paper/view/5795/1289"
                >
                  <div class="icon">
                    <svg
                      width="100"
                      height="100"
                      viewBox="0 0 600 600"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke="none"
                        stroke-width="0"
                        fill="#f5f5f5"
                        d="M300,541.5067337569781C382.14930387511276,545.0595476570109,479.8736841581634,548.3450877840088,526.4010558755058,480.5488172755941C571.5218469581645,414.80211281144784,517.5187510058486,332.0715597781072,496.52539010469104,255.14436215662573C477.37192572678356,184.95920475031193,473.57363656557914,105.61284051026155,413.0603344069578,65.22779650032875C343.27470386102294,18.654635553484475,251.2091493199835,5.337323636656869,175.0934190732945,40.62881213300186C97.87086631185822,76.43348514350839,51.98124368387456,156.15599469081315,36.44837278890362,239.84606092416172C21.716077023791087,319.22268207091537,43.775223500013084,401.1760424656574,96.891909868211,461.97329694683043C147.22146801428983,519.5804099606455,223.5754009179313,538.201503339737,300,541.5067337569781"
                      ></path>
                    </svg>
                    <i class="fa-regular fa-engine"></i>
                  </div>
                </a>
                <p>
                  Development of a WEB application for sizing electric motor
                  drive equipment.
                </p>
              </div>
            </div>

            <div
              class="col-lg-4 col-md-6 d-flex align-items-stretch mt-4"
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              <div class="icon-box iconbox-yellow">
                <a href="https://issuu.com/editora_valete/docs/ci284">
                  <div class="icon">
                    <svg
                      width="100"
                      height="100"
                      viewBox="0 0 600 600"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke="none"
                        stroke-width="0"
                        fill="#f5f5f5"
                        d="M300,503.46388370962813C374.79870501325706,506.71871716319447,464.8034551963731,527.1746412648533,510.4981551193396,467.86667711651364C555.9287308511215,408.9015244558933,512.6030010748507,327.5744911775523,490.211057578863,256.5855673507754C471.097692560561,195.9906835881958,447.69079081568157,138.11976852964426,395.19560036434837,102.3242989838813C329.3053358748298,57.3949838291264,248.02791733380457,8.279543830951368,175.87071277845988,42.242879143198664C103.41431057327972,76.34704239035025,93.79494320519305,170.9812938413882,81.28167332365135,250.07896920659033C70.17666984294237,320.27484674793965,64.84698225790005,396.69656628748305,111.28512138212992,450.4950937839243C156.20124167950087,502.5303643271138,231.32542653798444,500.4755392045468,300,503.46388370962813"
                      ></path>
                    </svg>
                    <i class="fa-solid fa-shield-halved"></i>
                  </div>
                </a>
                <p>
                  Strengthening Industrial Automation: Best Practices in
                  Cybersecurity
                </p>
              </div>
            </div>

            <!-- <div class="col-lg-4 col-md-6 d-flex align-items-stretch mt-4" data-aos="zoom-in" data-aos-delay="200">
            <div class="icon-box iconbox-red">
              <div class="icon">
                <svg width="100" height="100" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                  <path stroke="none" stroke-width="0" fill="#f5f5f5"
                    d="M300,532.3542879108572C369.38199826031484,532.3153073249985,429.10787420159085,491.63046689027357,474.5244479745417,439.17860296908856C522.8885846962883,383.3225815378663,569.1668002868075,314.3205725914397,550.7432151929288,242.7694973846089C532.6665558377875,172.5657663291529,456.2379748765914,142.6223662098291,390.3689995646985,112.34683881706744C326.66090330228417,83.06452184765237,258.84405631176094,53.51806209861945,193.32584062364296,78.48882559362697C121.61183558270385,105.82097193414197,62.805066853699245,167.19869350419734,48.57481801355237,242.6138429142374C34.843463184063346,315.3850353017275,76.69343916112496,383.4422959591041,125.22947124332185,439.3748458443577C170.7312796277747,491.8107796887764,230.57421082200815,532.3932930995766,300,532.3542879108572">
                  </path>
                </svg>
                <i class="bx bx-slideshow"></i>
              </div>
              <p>Quis consequatur saepe eligendi voluptatem consequatur dolor consequuntur</p>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 d-flex align-items-stretch mt-4" data-aos="zoom-in" data-aos-delay="300">
            <div class="icon-box iconbox-teal">
              <div class="icon">
                <svg width="100" height="100" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                  <path stroke="none" stroke-width="0" fill="#f5f5f5"
                    d="M300,566.797414625762C385.7384707136149,576.1784315230908,478.7894351017131,552.8928747891023,531.9192734346935,484.94944893311C584.6109503024035,417.5663521118492,582.489472248146,322.67544863468447,553.9536738515405,242.03673114598146C529.1557734026468,171.96086150256528,465.24506316201064,127.66468636344209,395.9583748389544,100.7403814666027C334.2173773831606,76.7482773500951,269.4350130405921,84.62216499799875,207.1952322260088,107.2889140133804C132.92018162631612,134.33871894543012,41.79353780512637,160.00259165414826,22.644507872594943,236.69541883565114C3.319112789854554,314.0945973066697,72.72355303640163,379.243833228382,124.04198916343866,440.3218312028393C172.9286146004772,498.5055451809895,224.45579914871206,558.5317968840102,300,566.797414625762">
                  </path>
                </svg>
                <i class="bx bx-arch"></i>
              </div>
              <p>Modi nostrum vel laborum. Porro fugit error sit minus sapiente sit aspernatur</p>
            </div>
          </div> -->
          </div>
        </div>
      </section>
      <!-- End Publications Section -->

      <!-- ======= Services Section ======= -->
      <!-- <section id="services" class="services">
            <div class="container" data-aos="fade-up">

                <div class="section-title">
                    <h2>Services</h2>
                    <p>Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex aliquid fuga eum quidem. Sit
                        sint consectetur velit. Quisquam quos quisquam cupiditate. Et nemo qui impedit suscipit alias
                        ea. Quia fugiat sit in iste officiis commodi quidem hic quas.</p>
                </div>

                <div class="row">

                    <div class="col-lg-4 col-md-6 d-flex align-items-stretch" data-aos="zoom-in" data-aos-delay="100">
                        <div class="icon-box iconbox-blue">
                            <div class="icon">
                                <svg width="100" height="100" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke="none" stroke-width="0" fill="#f5f5f5"
                                        d="M300,521.0016835830174C376.1290562159157,517.8887921683347,466.0731472004068,529.7835943286574,510.70327084640275,468.03025145048787C554.3714126377745,407.6079735673963,508.03601936045806,328.9844924480964,491.2728898941984,256.3432110539036C474.5976632858925,184.082847569629,479.9380746630129,96.60480741107993,416.23090153303,58.64404602377083C348.86323505073057,18.502131276798302,261.93793281208167,40.57373210992963,193.5410806939664,78.93577620505333C130.42746243093433,114.334589627462,98.30271207620316,179.96522072025542,76.75703585869454,249.04625023123273C51.97151888228291,328.5150500222984,13.704378332031375,421.85034740162234,66.52175969318436,486.19268352777647C119.04800174914682,550.1803526380478,217.28368757567262,524.383925680826,300,521.0016835830174">
                                    </path>
                                </svg>
                                <i class="bx bxl-dribbble"></i>
                            </div>
                            <h4><a href="">Lorem Ipsum</a></h4>
                            <p>Voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi</p>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 d-flex align-items-stretch mt-4 mt-md-0" data-aos="zoom-in"
                        data-aos-delay="200">
                        <div class="icon-box iconbox-orange ">
                            <div class="icon">
                                <svg width="100" height="100" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke="none" stroke-width="0" fill="#f5f5f5"
                                        d="M300,582.0697525312426C382.5290701553225,586.8405444964366,449.9789794690241,525.3245884688669,502.5850820975895,461.55621195738473C556.606425686781,396.0723002908107,615.8543463187945,314.28637112970534,586.6730223649479,234.56875336149918C558.9533121215079,158.8439757836574,454.9685369536778,164.00468322053177,381.49747125262974,130.76875717737553C312.15926192815925,99.40240125094834,248.97055460311594,18.661163978235184,179.8680185752513,50.54337015887873C110.5421016452524,82.52863877960104,119.82277516462835,180.83849132639028,109.12597500060166,256.43424936330496C100.08760227029461,320.3096726198365,92.17705696193138,384.0621239912766,124.79988738764834,439.7174275375508C164.83382741302287,508.01625554203684,220.96474134820875,577.5009287672846,300,582.0697525312426">
                                    </path>
                                </svg>
                                <i class="bx bx-file"></i>
                            </div>
                            <h4><a href="">Sed Perspiciatis</a></h4>
                            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore</p>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 d-flex align-items-stretch mt-4 mt-lg-0" data-aos="zoom-in"
                        data-aos-delay="300">
                        <div class="icon-box iconbox-pink">
                            <div class="icon">
                                <svg width="100" height="100" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke="none" stroke-width="0" fill="#f5f5f5"
                                        d="M300,541.5067337569781C382.14930387511276,545.0595476570109,479.8736841581634,548.3450877840088,526.4010558755058,480.5488172755941C571.5218469581645,414.80211281144784,517.5187510058486,332.0715597781072,496.52539010469104,255.14436215662573C477.37192572678356,184.95920475031193,473.57363656557914,105.61284051026155,413.0603344069578,65.22779650032875C343.27470386102294,18.654635553484475,251.2091493199835,5.337323636656869,175.0934190732945,40.62881213300186C97.87086631185822,76.43348514350839,51.98124368387456,156.15599469081315,36.44837278890362,239.84606092416172C21.716077023791087,319.22268207091537,43.775223500013084,401.1760424656574,96.891909868211,461.97329694683043C147.22146801428983,519.5804099606455,223.5754009179313,538.201503339737,300,541.5067337569781">
                                    </path>
                                </svg>
                                <i class="bx bx-tachometer"></i>
                            </div>
                            <h4><a href="">Magni Dolores</a></h4>
                            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia</p>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 d-flex align-items-stretch mt-4" data-aos="zoom-in"
                        data-aos-delay="100">
                        <div class="icon-box iconbox-yellow">
                            <div class="icon">
                                <svg width="100" height="100" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke="none" stroke-width="0" fill="#f5f5f5"
                                        d="M300,503.46388370962813C374.79870501325706,506.71871716319447,464.8034551963731,527.1746412648533,510.4981551193396,467.86667711651364C555.9287308511215,408.9015244558933,512.6030010748507,327.5744911775523,490.211057578863,256.5855673507754C471.097692560561,195.9906835881958,447.69079081568157,138.11976852964426,395.19560036434837,102.3242989838813C329.3053358748298,57.3949838291264,248.02791733380457,8.279543830951368,175.87071277845988,42.242879143198664C103.41431057327972,76.34704239035025,93.79494320519305,170.9812938413882,81.28167332365135,250.07896920659033C70.17666984294237,320.27484674793965,64.84698225790005,396.69656628748305,111.28512138212992,450.4950937839243C156.20124167950087,502.5303643271138,231.32542653798444,500.4755392045468,300,503.46388370962813">
                                    </path>
                                </svg>
                                <i class="bx bx-layer"></i>
                            </div>
                            <h4><a href="">Nemo Enim</a></h4>
                            <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis</p>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 d-flex align-items-stretch mt-4" data-aos="zoom-in"
                        data-aos-delay="200">
                        <div class="icon-box iconbox-red">
                            <div class="icon">
                                <svg width="100" height="100" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke="none" stroke-width="0" fill="#f5f5f5"
                                        d="M300,532.3542879108572C369.38199826031484,532.3153073249985,429.10787420159085,491.63046689027357,474.5244479745417,439.17860296908856C522.8885846962883,383.3225815378663,569.1668002868075,314.3205725914397,550.7432151929288,242.7694973846089C532.6665558377875,172.5657663291529,456.2379748765914,142.6223662098291,390.3689995646985,112.34683881706744C326.66090330228417,83.06452184765237,258.84405631176094,53.51806209861945,193.32584062364296,78.48882559362697C121.61183558270385,105.82097193414197,62.805066853699245,167.19869350419734,48.57481801355237,242.6138429142374C34.843463184063346,315.3850353017275,76.69343916112496,383.4422959591041,125.22947124332185,439.3748458443577C170.7312796277747,491.8107796887764,230.57421082200815,532.3932930995766,300,532.3542879108572">
                                    </path>
                                </svg>
                                <i class="bx bx-slideshow"></i>
                            </div>
                            <h4><a href="">Dele Cardo</a></h4>
                            <p>Quis consequatur saepe eligendi voluptatem consequatur dolor consequuntur</p>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 d-flex align-items-stretch mt-4" data-aos="zoom-in"
                        data-aos-delay="300">
                        <div class="icon-box iconbox-teal">
                            <div class="icon">
                                <svg width="100" height="100" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke="none" stroke-width="0" fill="#f5f5f5"
                                        d="M300,566.797414625762C385.7384707136149,576.1784315230908,478.7894351017131,552.8928747891023,531.9192734346935,484.94944893311C584.6109503024035,417.5663521118492,582.489472248146,322.67544863468447,553.9536738515405,242.03673114598146C529.1557734026468,171.96086150256528,465.24506316201064,127.66468636344209,395.9583748389544,100.7403814666027C334.2173773831606,76.7482773500951,269.4350130405921,84.62216499799875,207.1952322260088,107.2889140133804C132.92018162631612,134.33871894543012,41.79353780512637,160.00259165414826,22.644507872594943,236.69541883565114C3.319112789854554,314.0945973066697,72.72355303640163,379.243833228382,124.04198916343866,440.3218312028393C172.9286146004772,498.5055451809895,224.45579914871206,558.5317968840102,300,566.797414625762">
                                    </path>
                                </svg>
                                <i class="bx bx-arch"></i>
                            </div>
                            <h4><a href="">Divera Don</a></h4>
                            <p>Modi nostrum vel laborum. Porro fugit error sit minus sapiente sit aspernatur</p>
                        </div>
                    </div>

                </div>

            </div>
        </section>End Services Section -->

      <!-- ======= Testimonials Section ======= -->
      <section
        id="testimonials"
        class="testimonials section-bg"
        style="display: none"
      >
        <!-- display: none -> disable div -->
        <!-- display: none -> disable div -->
        <div class="container" data-aos="fade-up">
          <div class="section-title">
            <h2>Testimonials</h2>
          </div>

          <div
            class="testimonials-slider swiper"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div class="swiper-wrapper">
              <div class="swiper-slide">
                <div class="testimonial-item">
                  <img
                    src="assets/img/testimonials/testimonials-1.jpg"
                    class="testimonial-img"
                    alt=""
                  />
                  <h3>Saul Goodman</h3>
                  <h4>Ceo &amp; Founder</h4>
                  <p>
                    <i class="bx bxs-quote-alt-left quote-icon-left"></i>
                    Proin iaculis purus consequat sem cure digni ssim donec
                    porttitora entum suscipit rhoncus. Accusantium quam,
                    ultricies eget id, aliquam eget nibh et. Maecen aliquam,
                    risus at semper.
                    <i class="bx bxs-quote-alt-right quote-icon-right"></i>
                  </p>
                </div>
              </div>
              <!-- End testimonial item -->

              <div class="swiper-slide">
                <div class="testimonial-item">
                  <img
                    src="assets/img/testimonials/testimonials-2.jpg"
                    class="testimonial-img"
                    alt=""
                  />
                  <h3>Sara Wilsson</h3>
                  <h4>Designer</h4>
                  <p>
                    <i class="bx bxs-quote-alt-left quote-icon-left"></i>
                    Export tempor illum tamen malis malis eram quae irure esse
                    labore quem cillum quid cillum eram malis quorum velit fore
                    eram velit sunt aliqua noster fugiat irure amet legam anim
                    culpa.
                    <i class="bx bxs-quote-alt-right quote-icon-right"></i>
                  </p>
                </div>
              </div>
              <!-- End testimonial item -->

              <div class="swiper-slide">
                <div class="testimonial-item">
                  <img
                    src="assets/img/testimonials/testimonials-3.jpg"
                    class="testimonial-img"
                    alt=""
                  />
                  <h3>Jena Karlis</h3>
                  <h4>Store Owner</h4>
                  <p>
                    <i class="bx bxs-quote-alt-left quote-icon-left"></i>
                    Enim nisi quem export duis labore cillum quae magna enim
                    sint quorum nulla quem veniam duis minim tempor labore quem
                    eram duis noster aute amet eram fore quis sint minim.
                    <i class="bx bxs-quote-alt-right quote-icon-right"></i>
                  </p>
                </div>
              </div>
              <!-- End testimonial item -->

              <div class="swiper-slide">
                <div class="testimonial-item">
                  <img
                    src="assets/img/testimonials/testimonials-4.jpg"
                    class="testimonial-img"
                    alt=""
                  />
                  <h3>Matt Brandon</h3>
                  <h4>Freelancer</h4>
                  <p>
                    <i class="bx bxs-quote-alt-left quote-icon-left"></i>
                    Fugiat enim eram quae cillum dolore dolor amet nulla culpa
                    multos export minim fugiat minim velit minim dolor enim duis
                    veniam ipsum anim magna sunt elit fore quem dolore labore
                    illum veniam.
                    <i class="bx bxs-quote-alt-right quote-icon-right"></i>
                  </p>
                </div>
              </div>
              <!-- End testimonial item -->

              <div class="swiper-slide">
                <div class="testimonial-item">
                  <img
                    src="assets/img/testimonials/testimonials-5.jpg"
                    class="testimonial-img"
                    alt=""
                  />
                  <h3>John Larson</h3>
                  <h4>Entrepreneur</h4>
                  <p>
                    <i class="bx bxs-quote-alt-left quote-icon-left"></i>
                    Quis quorum aliqua sint quem legam fore sunt eram irure
                    aliqua veniam tempor noster veniam enim culpa labore duis
                    sunt culpa nulla illum cillum fugiat legam esse veniam culpa
                    fore nisi cillum quid.
                    <i class="bx bxs-quote-alt-right quote-icon-right"></i>
                  </p>
                </div>
              </div>
              <!-- End testimonial item -->
            </div>
            <div class="swiper-pagination"></div>
          </div>
        </div>
      </section>
      <!-- End Testimonials Section -->

      <!-- ======= Contact Section ======= -->
      <section id="contact" class="contact">
        <div class="container" data-aos="fade-up">
          <div class="section-title">
            <h2>Contact</h2>
          </div>

          <div class="row mt-1">
            <div class="col-lg-4">
              <div class="info">
                <div class="address">
                  <i class="bi bi-geo-alt"></i>
                  <h4>Location:</h4>
                  <p>Sertãozinho, São Paulo, Brazil</p>
                </div>

                <div class="email">
                  <i class="bi bi-envelope"></i>
                  <h4>Email:</h4>
                  <p>jonathantosilva@hotmail.com</p>
                </div>

                <div class="phone">
                  <i class="bi bi-phone"></i>
                  <h4>Call:</h4>
                  <p>+55 (16) 993232745</p>
                </div>
              </div>
            </div>

            <div class="col-lg-8 mt-5 mt-lg-0">
              <form
                action="https://formsubmit.co/ajax/38f07adcf79cdff396311cf93b77a31a"
                method="post"
                role="form"
                class="contact-form"
              >
                <div class="row">
                  <div class="col-md-6 form-group">
                    <input
                      type="text"
                      name="name"
                      class="form-control"
                      id="name"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div class="col-md-6 form-group mt-3 mt-md-0">
                    <input
                      type="email"
                      class="form-control"
                      name="email"
                      id="email"
                      placeholder="Your Email"
                      required
                    />
                  </div>
                </div>
                <div class="form-group mt-3">
                  <input
                    type="text"
                    class="form-control"
                    name="subject"
                    id="subject"
                    placeholder="Subject"
                    required
                  />
                </div>
                <div class="form-group mt-3">
                  <textarea
                    class="form-control"
                    name="message"
                    rows="5"
                    placeholder="Message"
                    required
                  ></textarea>
                  <input type="hidden" name="_captcha" value="false" />
                </div>
                <div class="my-3">
                  <div class="loading">Loading</div>
                  <div class="error-message"></div>
                  <div class="sent-message">
                    Your message has been sent. Thank you!
                  </div>
                </div>
                <div class="text-center">
                  <button type="submit">Send Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <!-- End Contact Section -->
    </main>
    <!-- End #main -->

    <!-- ======= Footer ======= -->
    <footer id="footer">
      <div class="container">
        <h3>Jonathan Tobias da Silva</h3>
        <p>
          "And the only way to do great work is to love what you do. If you
          haven't found it yet, keep looking. Don't settle. As with all matters
          of the heart, you'll know when you find it". (Steve Jobs)
        </p>
        <div class="social-links">
          <a href="https://www.linkedin.com/in/jonathantsilva/" class="linkedin"
            ><i class="fa-brands fa-linkedin-in fa-sm"></i
          ></a>
          <a href="https://www.github.com/JonathanTSilva" class="github"
            ><i class="fa-brands fa-github fa-sm"></i
          ></a>
          <a href="https://orcid.org/0000-0002-2511-259X" class="orcid"
            ><i class="fa-brands fa-orcid fa-sm"></i
          ></a>
          <a
            href="mailto:jonathantosilva@hotmail.com"
            target="_blank"
            class="mail"
            ><i class="fa fa-envelope fa-sm"></i
          ></a>
        </div>
      </div>
    </footer>
    <!-- End Footer -->

    <div id="preloader"></div>
    <a
      href="#"
      class="back-to-top d-flex align-items-center justify-content-center"
      ><i class="bi bi-arrow-up-short"></i
    ></a>

    <!-- Vendor JS Files -->
    <script src="assets/vendor/purecounter/purecounter_vanilla.js"></script>
    <script src="assets/vendor/aos/aos.js"></script>
    <script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="assets/vendor/glightbox/js/glightbox.min.js"></script>
    <script src="assets/vendor/isotope-layout/isotope.pkgd.min.js"></script>
    <script src="assets/vendor/swiper/swiper-bundle.min.js"></script>
    <script src="assets/vendor/typed.js/typed.umd.js"></script>
    <script src="assets/vendor/waypoints/noframework.waypoints.js"></script>
    <script src="assets/vendor/jquery/jquery.min.js"></script>
    <script src="https://code.jquery.com/jquery-migrate-3.3.2.min.js"></script>

    <!-- Template Main JS File -->
    <script src="assets/js/main.js"></script>
    <script src="assets/js/contact-validate.js"></script>
  </body>
</html>

====================================================================================================
Linkedin
====================================================================================================
Contact
jonathantobias2009@hotmail.
com
www.linkedin.com/in/jonathantsilva
(LinkedIn)
jonathantsilva.com/ (Personal)
Top Skills
L2/L3 protocols
Industrial Automation
C (Programming Language)
Certifications
Introduction to Generative AI
C++ Development: Advanced
Concepts, Lambda Expressions, and
Best Practices
C++ Essential Training
Create and Manage Cloud
Resources
C Programming for Embedded
Applications
Publications
Fortificando a automação industrial:
melhores práticas em Segurança
Cibernética
Desenvolvimento de uma
ferramenta baseada em web para
dimensionamento de equipamentos
para acionamentos de motores
elétricos
An intelligent fault diagnosis for
centrifugal pumps based on electric
current information available in
industrial communication networks
A Survey on OPC UA protocol:
overview, challenges and
opportunities
Jonathan Tobias
Senior Software Engineer, M.Sc. | Embedded Software and Systems
Brazil
Summary
What happens when technology, engineering, and an insatiable
curiosity collide? You get someone who thrives on solving complex
problems, pushing boundaries, and driving real innovation. And
that’s what motivates me every day.
From Embedded Software to AI and Cybersecurity, I apply cuttingedge solutions to industrial challenges, shaping the future of
technology. With a strong academic foundation and a relentless
pursuit of knowledge, I continuously adapt, learn, and evolve—
because the world doesn’t stand still, and neither do I.
Curious to know how innovation can drive real change? Follow me
and let's discover it together.
Experience
act digital
Senior Embedded Software Engineer
February 2026 - Present (2 months)
São Paulo, Brazil
Global technology consultancy working in a strategic partnership with
Schneider Electric on R&D projects for Industrial Automation and Industry 4.0,
focusing on critical systems and global connectivity.
➛ Develop and customize mission-critical embedded software for Embedded
Linux and RTOS (VxWorks), focusing on industrial switches and PLCs;
➛ Adapt software solutions to meet strict industrial and substation
requirements, ensuring high availability, determinism, and peak performance;
➛ Implement and maintain industrial communication protocols, including OPC
UA, EtherNet/IP, and Modbus, as well as TCP/IP and UDP network stacks;
➛ Work closely with hardware teams on device bring-up, driver integration,
and software-hardware productization for global markets;
Page 1 of 4
➛ Optimize real-time system behavior and latency to meet the rigorous
standards of Industrial IoT (IIoT) and critical infrastructure;
➛ Collaborate with cross-functional global teams (U.S. and Brazil), applying
DevOps practices, CI/CD, and advanced troubleshooting to ensure software
excellence.
Datacom
Embedded Software Engineer
September 2024 - February 2026 (1 year 6 months)
Eldorado do Sul, Rio Grande do Sul, Brazil
➛ Develop and maintain C/C++ and Python software, optimizing device
performance and ensuring high reliability;
➛ Enhance code reliability through the design and execution of unit tests and
automated integration tests using GoogleTest and the Robot Framework;
➛ Build and debug embedded Linux systems, with a focus on performance
tuning and system stability across various hardware platforms;
➛ Implement and maintain protocols at the Layer 3 level (IP, OSPF, BGP);
➛ Perform thorough code reviews following best practices in TDD, CI/CD, and
Clean Code principles;
➛ Conduct in-depth troubleshooting on complex telecommunications systems,
resolving critical issues and minimizing system downtime.
Nova SMAR S/A
3 years 9 months
R&D Engineer
January 2024 - September 2024 (9 months)
Sertãozinho, São Paulo, Brazil
As a member of the Software and Systems team in the Research and
Development (R&D) department of Nova Smar S/A - a Brazilian multinational
pioneer in Fieldbus and a leader in the industrial automation market - I
am involved in project management of software and the development,
maintenance, and quality assurance of System302 and other tools and
applications associated with it. This experience encompasses significant
achievements and activities, including:
➛ Coordinate a product development initiative, managing a team of 10
engineers and developers to deliver high-quality embedded software solutions;
➛ Apply cybersecurity measures to ensure compliance with IEC 62443 and OPAS standards, enhancing the security and integrity of embedded systems;
Page 2 of 4
➛ Orchestrate the migration of version control systems from CVS to Git for
the R&D department, implementing CI/CD pipelines to streamline project
workflows;
➛ Lead the development and maintenance of Linux operating systems and
kernels using the Yocto Project for real-time operating systems (RTOS);
➛ Develop software applications and internal tools to optimize workflows,
using Python, C/C++, Java, and Bash/Powershell;
➛ Work in various computing environments, including Embedded systems,
Linux, Windows, Containers, Virtual Machines (VMs), and Cloud platforms;
➛ Experience with hardware interfaces, networking protocols, and
communication standards.
: , , , , , .
Jr. R&D Engineer
January 2022 - December 2023 (2 years)
Sertãozinho, São Paulo, Brazil
➛ Conducting research in the areas of Cybersecurity and Artificial Intelligence,
with a focus on applicability in the automation and control industry. Project
proposals accepted through solid proof of concepts have enhanced system
security and saved time in internal processes by implementing machine
learning tools.
➛ Developing desktop (Windows) and embedded Linux applications for
System302, as well as internal tools to optimize workflows, using Python, Java,
C/C++ (Embedded), and Bash/Powershell.
➛ Comprehensive application of Software Engineering and Computer Network
concepts in development processes, such as version control (Git); "Clean
Code" and "Clean Architecture"; software testing and debugging; virtualization,
containerization, and orchestration; continuous integration and deployment (CI/
CD); and communication protocols.
➛ Member of the internal System302 project team, overseeing deliveries,
milestones, and issues. Coordinating the system's quality assurance process
by creating test plans and cases, along with setting priorities.
➛ Writing technical documentation in English and Portuguese.
➛ Developing and conducting internal training sessions, ensuring the effective
dissemination of knowledge.
: , , , , .
R&D Intern
January 2021 - December 2021 (1 year)
Page 3 of 4
Sertãozinho, São Paulo, Brazil
Broad involvement in various topics within the Software and Systems team of
the Electronic Development department (R&D), based on providing practical
knowledge for understanding and resolving complexities in the professional
context, supported by an investigative stance. Key contributions stand out in:
➛ Conducting research in the field of industrial automation and software
engineering, resulting in the approval of a new project through a proof of
concept.
➛ Developing new internal tools for the R&D department, accompanied by the
creation of their respective technical documentation, as well as maintaining
existing code to ensure operational efficiency.
➛ Creating test plans and cases and effectively coordinating the execution of
corresponding tests.
➛ Providing specialized technical support in the Distributed Control System -
System302.
: , , , , (, , , ) .
Education
University of São Paulo
Master's degree, Electrical Engineering · (2022 - 2025)
Federal Institute of Education, Science and Technology of São Paulo
- IFSP
Bachelor's degree, Electrical and Electronic Engineering · (2017 - 2021)
State Technical School of São Paulo - ETEC
Administration Technician, Administration, Business and
Marketing · (2014 - 2016)

====================================================================================================
Resume (CV)
====================================================================================================
\name{Jonathan Tobias da Silva}
\tagline{Senior Software Engineer, M.Sc. | Embedded Software and Systems}
%% You can add multiple photos on the left or right
\photoR{2.5cm}{profile.jpg}
% \photoL{2cm}{Yacht_High,Suitcase_High}
\personalinfo{%
  % Not all of these are required!
  % You can add your own with \printinfo{symbol}{detail}
    \email{jonathantosilva@hotmail.com}
    \phone{+55 (16) 99323-2745}
    % \mailaddress{Address, Street, 00000 County}
    \location{São Paulo, Brazil}
    \homepage{jontobias.com}
    % \twitter{@jonathantsilva}
    \linkedin{jonathantsilva}
    \github{jonathantsilva} % I'm just making this up though.
    \orcid{0000-0002-2511-259X} % Obviously making this up too.

  %% You can add your own arbitrary detail with
  %% \printinfo{symbol}{detail}[optional hyperlink prefix]
  % \printinfo{\faPaw}{Hey ho!}
  %% Or you can declare your own field with
  %% \NewInfoFiled{fieldname}{symbol}[optional hyperlink prefix] and use it:
  % \NewInfoField{gitlab}{\faGitlab}[https://gitlab.com/]
  % \gitlab{your_id}
	%%
  %% For services and platforms like Mastodon where there isn't a
  %% straightforward relation between the user ID/nickname and the hyperlink,
  %% you can use \printinfo directly e.g.
  % \printinfo{\faMastodon}{@username@instace}[https://instance.url/@username]
  %% But if you absolutely want to create new dedicated info fields for
  %% such platforms, then use \NewInfoField* with a star:
  % \NewInfoField*{mastodon}{\faMastodon}
  %% then you can use \mastodon, with TWO arguments where the 2nd argument is
  %% the full hyperlink.
  % \mastodon{@username@instance}{https://instance.url/@username}
}

\makecvheader

%-------------------------- ABSTRACT -------------------------|

\begin{justify}

    Senior Software Engineer specializing in embedded software and systems, focusing on operational and information technology domains. Dedicated to leveraging technology and engineering expertise to address real-world challenges and drive meaningful progress.

\end{justify}

%---------------------------- BODY ---------------------------|
% Start a 2-column paracol. Both the left and right columns will 
% automatically break across pages if things get too long.
\begin{paracol}{2}

%----- EXPERIENCE: Begin ---|
    \cvsection{Experience}

    \cvevent{Senior Embedded Software Engineer}{Act Digital}{2026 -- Ongoing}{Remote}
        \begin{itemize}
            \item Develop and customize mission-critical embedded software for Embedded Linux and RTOS (VxWorks), focusing on industrial switches and PLCs.
            \item Adapt software solutions to meet strict industrial and substation requirements, ensuring high availability, determinism, and peak performance.
            \item Implement and maintain industrial communication protocols, including OPC UA, EtherNet/IP, and Modbus, as well as TCP/IP and UDP network stacks.
            \item Work closely with hardware teams on device bring-up, driver integration, and software-hardware productization for global markets.
            \item Optimize real-time system behavior and latency to meet the rigorous standards of Industrial IoT (IIoT) and critical infrastructure.
            \item Collaborate with cross-functional global teams (U.S. and Brazil), applying DevOps practices, CI/CD, and advanced troubleshooting to ensure software excellence.
        \end{itemize}

    \divider

    \cvevent{R\&D Embedded Software Engineer}{Datacom}{2024 -- 2026}{Remote}
        \begin{itemize}
            \item Develop and maintain C/C++ and Python software, optimizing device performance and ensuring high reliability.
            \item Enhance code reliability through the design and execution of unit tests and automated integration tests using GoogleTest and the Robot Framework.
            \item Develop and debug embedded Linux systems, with a focus on performance tuning and system stability across various hardware platforms.
            \item Implement and maintain protocols at the Layer 3 level.
            \item Conduct code reviews following best practices in TDD, CI/CD, and Clean Code principles.
            \item Conduct in-depth troubleshooting on complex telecommunications systems, resolving critical issues and minimizing system downtime.
        \end{itemize}

    \divider

    \cvevent{R\&D Electronic Intelligence Analyst}{Nova Smar}{2023 -- 2024}{Sertãozinho, SP, Brazil}
        \begin{itemize}
            \item Coordinate a product development initiative, 
            % demonstrating adeptness in people management, leadership, and agile methodologies, 
            managing a team of 10 engineers and developers.
            % \item Linux operating system and kernel development using the Yocto Project for RTOS.
            \item Apply cybersecurity measures to ensure compliance with the IEC 62443 and O-PAS standards, enhancing the security and integrity of embedded systems.
            \item Orchestrate the migration of version control systems from CVS to Git for the R\&D department, implementing CI/CD pipelines to streamline project workflows.
            \item Lead the development and maintenance of Linux operating systems and kernels using the Yocto Project for real-time operating systems (RTOS).
            \item Develop desktop and embedded software applications and internal tools to optimize workflows.
            \item Experience with hardware interfaces, networking protocols, and communication standards.
            % \centering{\color{gray!70}{\item[$\downarrow$] \textit{Continued responsibilities from the experience below.}}}
        \end{itemize}

    \divider

    \cvevent{R\&D Electronic Intelligence Assistant}{Nova Smar}{2022 -- 2023}{Sertãozinho, SP, Brazil}
        \begin{itemize}
            \item Research Cybersecurity and Artificial Intelligence for Industrial Automation, ensuring system security and efficiency gains of 76\% in production processes through Machine Learning tools.
            \item Develop desktop and embedded applications for System302 in Linux environments, including firmware patches that have enabled updates for the largest installed base of the system.
            \item Apply a comprehensive set of Software Engineering and Computer Network concepts to development processes such as version control, clean code, and CI/CD.
            \item Manage System302 project milestones and quality assurance processes to ensure project success.
            \item Craft technical documentation in Portuguese and English.
            \item Develop and conduct internal training.
        \end{itemize}
    
    \divider
    \cvevent{R\&D Intern}{Nova Smar}{2021}{Sertãozinho, SP, Brazil}
        \begin{itemize}
            \item Experience in software development, research, testing, documentation, technical support, and software management within R\&D.
        \end{itemize}

    % \divider

    % \cvevent{Master's thesis}{University of São Paulo (USP)}{2022--Ongoing}{São Carlos, SP, Brazil}
    %     \begin{itemize}
    %         \item Development of an intrusion detection method in OPC UA networks based on Machine Learning techniques. % The system utilizes Artificial Neural Networks (ANNs) and Support Vector Machines (SVMs) to effectively detect Man-in-the-Middle (MITM), Denial-of-Service (DoS), and packet injection attacks on an industrial network that operates using the OPC UA protocol.
    %     \end{itemize}

    % \divider
    
    % \cvevent{Scientific Initiation Scholarship}{Federal Institute of São Paulo (IFSP)}{2020}{Sertãozinho, SP}
    %     \begin{itemize}
    %         \item Diagnostic system for failures in hydraulic pumps through electrical current analysis and Machine Learning tools.
    %         % \item Project: "Diagnostic system for failures in hydraulic pumps through electrical current analysis and Machine Learning tools", with presentation and articles published in the 11th CONICT and 14th INDUSCON (IEEE).
    %     \end{itemize}
    % \cvevent{}{}{2019}{}
    %     \begin{itemize}
    %         \item Development of a web-based tool for dimensioning equipment for electric motor drives
    %         % \item Project: "Development of a web-based tool for dimensioning equipment for electric motor drives", with presentation and articles published at the 10th CONICT.
    %     \end{itemize}
%----- EXPERIENCE: End ---|

%----- ROUTINE: Begin ----|
    % \cvsection{A Day of My Life}

    % % Adapted from @Jake's answer from http://tex.stackexchange.com/a/82729/226
    % % \wheelchart{outer radius}{inner radius}{
    % % comma-separated list of value/text width/color/detail}
    % % Some ad-hoc tweaking to adjust the labels so that they don't overlap
    % \hspace*{-1em}  %% quick hack to move the wheelchart a bit left
    % \wheelchart{1.5cm}{0.5cm}{%
    % 10/13em/accent!30/Sleeping \& dreaming about work,
    % 25/9em/accent!60/Public resolving issues with Yahoo!\ investors,
    % 5/11em/accent!10/\footnotesize\\[1ex]New York \& San Francisco Ballet Jawbone board member,
    % 20/11em/accent!40/Spending time with family,
    % 5/8em/accent!20/\footnotesize Business development for Yahoo!\ after the Verizon acquisition,
    % 30/9em/accent/Showing Yahoo!\ \mbox{employees} that their work has meaning,
    % 5/8em/accent!20/Baking cupcakes
    % }
%----- ROUTINE: End --------|

% % use ONLY \newpage if you want to force a page break for
% % ONLY the currentc column
% \newpage

%% Switch to the right column. This will now automatically move to the second
%% page if the content is too long.
\switchcolumn

%----- EDUCATION: Begin ----|
    \cvsection{Education}

    \cvevent{Master in Electrical Engineering}{University of São Paulo (USP)}{ 2022 -- 2025 }{São Carlos, SP, Brazil}
    \textbf{Thesis:}
    \begin{itemize}
        \item Vulnerability analysis of industrial OPC UA networks.
    \end{itemize}

    \divider

    \cvevent{Bachelor in Electrical Engineering}{Federal Institute of São Paulo (IFSP)}{ 2017 -- 2021 }{Sertãozinho, SP, Brazil}
    \textbf{Final Paper:}
    \begin{itemize}
        \item Cloud-based intelligent system for the detection of hydraulic pump failures.
    \end{itemize}
    % \vspace*{5pt}
    % \textbf{Scientific Initiation Scholarship:}
    % \begin{itemize}
    %     \item Diagnostic system for hydraulic pumps failures through electrical current analysis and machine learning tools.
    %     \item Development of a Web-based tool for dimensioning equipment for electric motor drives.
    % \end{itemize}

    \divider

    \cvevent{Certificate in Administration}{ETEC Antônio de Pádua Cardoso}{ 2014 -- 2016 }{Batatais, SP, Brazil}
    \begin{itemize}
        \item Acquired foundational technical knowledge essential for business and people management.
    \end{itemize}
%----- EDUCATION: End ------|

%----- TOPICS: Begin -------|
    \cvsection{Topics of Interest}

    \cvtag{Embedded Systems}
    \cvtag{Convergence IT/OT}
    \cvtag{Linux}
    \cvtag{Cybersec}
    \cvtag{Cloud Computing}
    \cvtag{AI/ML}
    \cvtag{Management}
    \cvtag{Software Engineering}
    \cvtag{Communication Protocols}
    \cvtag{Programming Languages}
    \cvtag{Data Science \& Analystics}
%----- TOPICS: End ---------|

%----- PUBLICATIONS: Begin -|
    \cvsection{Publications}

    % %% Specify your last name(s) and first name(s) as given in the .bib to automatically bold your own name in the publications list.
    % %% One caveat: You need to write \bibnamedelima where there's a space in your name for this to work properly; or write \bibnamedelimi if you use initials in the .bib
    % %% You can specify multiple names, especially if you have changed your name or if you need to highlight multiple authors.
    \mynames{da\bibnamedelima Silva/Jonathan\bibnamedelima Tobias,
    Da\bibnamedelima Silva/Jonathan\bibnamedelima Tobias,
    Silva/Jonathan\bibnamedelima Tobias,
    da\bibnamedelima Silva/J.\bibnamedelimi T.,
    Da\bibnamedelima Silva/J.\bibnamedelimi T.,
    Silva/J.\bibnamedelimi T.,}
    % %% MAKE SURE THERE IS NO SPACE AFTER THE FINAL NAME IN YOUR \mynames LIST

    \nocite{*}

    % \printbibliography[heading=pubtype,title={\printinfo{\faBook}{Books}},type=book]

    % \divider

    \printbibliography[heading=pubtype,title={\printinfo{\faFile*[regular]}{Journal Articles}}, type=article]

    \divider

    \printbibliography[heading=pubtype,title={\printinfo{\faUsers}{Conference Proceedings}},type=inproceedings]
%----- PUBLICATIONS: End ---|

\end{paracol}

%----- SKILLS: Begin -------|
\cvsection{Skills}

    \begin{paracol}{2}
        \cvproject{Technical}
        \begin{itemize}
            \item \textbf{Computer technologies and programming languages:} C, C++, Python, ShellScript, (Embedded) Linux, Git, Docker, \LaTeX, Qt (+QML), Database (MongoDB, MySQL, PostgreSQL);
            \item \textbf{R\&D methodologies and techniques:} TDD, DevOps (CI/CD, Automation), FMEA;
            % \item \textbf{Applications:} Visual Studio (+Code), MATLAB, cloud platform (GCP), virtualization (VBox, Vmware (+ESXi), Hyper-V, ProxMox), industrial automation configurators (System302, TIAPortal);
            \item \textbf{Experience with agile methods and tools:} OKR, SCRUM, Kanban, Gerrit, GitHub, GitLab, Bugzilla, Jenkins, Mantis Bug Tracker, Atlassian Tools, DotProject.
        \end{itemize}

        \switchcolumn

        \cvproject{Professional}
        \begin{itemize}
            \item High leadership ability;
            % \item Problem-Solving;
            % \item Very creative, proactive, and innovative;
            \item High adaptability;
            \item Deadline-Oriented;
            % \item Consistently fulfilling obligations with the highest quality;
            \item Eagerness for knowledge;
            \item Excellent teamwork skills;
            \item Always ready for a collaborative environment.
        \end{itemize}

    \end{paracol}
