"""AI-powered question generator using Gemini 2.5 Flash"""
import os
import json
import re
import asyncio
import random
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import uuid
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Import models
from models import Question, QuestionOption, DifficultyLevel


def _normalize_question_text(text: str) -> str:
    """Cheap normalization for de-duplication."""
    return re.sub(r"\s+", " ", re.sub(r"[^a-zA-Z0-9]+", " ", (text or "").lower())).strip()


# Physics Syllabus (extracted from PDF)
PHYSICS_SYLLABUS = {
    "Electrostatics": [
        "Electric charges and conservation",
        "Coulomb's law and superposition principle",
        "Electric field and field lines",
        "Electric dipole and torque",
        "Gauss's theorem and applications",
        "Electric potential and equipotential surfaces",
        "Capacitors and capacitance",
        "Dielectrics and polarization"
    ],
    "Current Electricity": [
        "Electric current and drift velocity",
        "Ohm's law and resistance",
        "Resistivity and temperature dependence",
        "Series and parallel combinations",
        "Kirchhoff's laws",
        "Wheatstone bridge and potentiometer",
        "Electric power and energy"
    ],
    "Magnetic Effects of Current": [
        "Biot-Savart law",
        "Ampere's circuital law",
        "Force on moving charge in magnetic field",
        "Force on current-carrying conductor",
        "Torque on current loop",
        "Moving coil galvanometer"
    ],
    "Electromagnetic Induction": [
        "Faraday's laws of electromagnetic induction",
        "Lenz's law",
        "Motional EMF",
        "Eddy currents",
        "Self and mutual inductance",
        "AC generator and transformer"
    ],
    "Alternating Current": [
        "AC voltage applied to resistor, inductor, capacitor",
        "LCR series circuit and resonance",
        "Power in AC circuits",
        "LC oscillations",
        "Transformers"
    ],
    "Electromagnetic Waves": [
        "Displacement current and Maxwell's equations",
        "Electromagnetic spectrum",
        "Properties of EM waves"
    ],
    "Ray Optics": [
        "Reflection and refraction",
        "Total internal reflection",
        "Lenses and mirrors",
        "Optical instruments",
        "Prism and dispersion"
    ],
    "Wave Optics": [
        "Huygens' principle",
        "Interference and Young's double slit",
        "Diffraction",
        "Polarization"
    ],
    "Dual Nature of Matter and Radiation": [
        "Photoelectric effect",
        "Einstein's photoelectric equation",
        "de Broglie hypothesis"
    ],
    "Atoms and Nuclei": [
        "Rutherford's model and Bohr model",
        "Hydrogen spectrum",
        "Radioactivity",
        "Nuclear fission and fusion",
        "Mass-energy equivalence"
    ],
    "Electronic Devices": [
        "Semiconductors and energy bands",
        "PN junction diode",
        "Rectifiers",
        "Photodiodes and solar cells"
    ]
}

# Mathematics Syllabus (extracted from PDF)
MATHEMATICS_SYLLABUS = {
    "Matrices and Determinants": [
        "Types of matrices",
        "Matrix operations",
        "Transpose and symmetric matrices",
        "Determinant calculations",
        "Inverse of a matrix",
        "Solving system of linear equations"
    ],
    "Calculus - Differentiation": [
        "Higher order derivatives",
        "Chain rule",
        "Implicit differentiation",
        "Parametric differentiation",
        "Logarithmic differentiation"
    ],
    "Applications of Derivatives": [
        "Rate of change",
        "Increasing and decreasing functions",
        "Maxima and minima",
        "Tangents and normals"
    ],
    "Integration": [
        "Indefinite integrals",
        "Integration by substitution",
        "Integration by parts",
        "Integration by partial fractions",
        "Definite integrals"
    ],
    "Applications of Integration": [
        "Area under curves",
        "Area between curves"
    ],
    "Differential Equations": [
        "Order and degree",
        "Variable separable method",
        "Homogeneous differential equations",
        "Linear differential equations"
    ],
    "Vectors": [
        "Vector operations",
        "Scalar and vector products",
        "Position vectors",
        "Section formula"
    ],
    "Three Dimensional Geometry": [
        "Direction cosines and ratios",
        "Equation of a line",
        "Shortest distance between lines",
        "Equation of a plane"
    ],
    "Linear Programming": [
        "Formulation of LPP",
        "Graphical method",
        "Feasible region",
        "Optimal solution"
    ],
    "Probability": [
        "Conditional probability",
        "Bayes theorem",
        "Random variables",
        "Binomial distribution",
        "Poisson distribution"
    ]
}

# All subject syllabi
SUBJECT_SYLLABUS = {
    "Physics": PHYSICS_SYLLABUS,
    "Mathematics": MATHEMATICS_SYLLABUS,
    "Geography": {
        "Fundamentals of Human Geography": [
            "Human Geography: Nature and Scope",
            "Population distribution, density and growth",
            "Population change: determinants and spatial patterns",
            "Human development: concept and indicators",
            "Primary activities: gathering, pastoral, mining, subsistence and modern agriculture",
            "Secondary activities: manufacturing and industry types",
            "Tertiary and quaternary activities",
            "Transport: roads, railways, trans-continental railways",
            "Water transport: inland waterways and major ocean routes",
            "Air transport: intercontinental routes",
            "Pipelines",
            "Satellite communication and cyberspace",
            "International trade: basis, patterns, ports, WTO",
        ],
        "India: People and Economy": [
            "Population distribution, density and growth in India",
            "Population composition: linguistic, religious, rural-urban, occupational",
            "Human settlements: rural types and distribution",
            "Urban settlements: types, distribution and functional classification",
            "Land resources and land use",
            "Agriculture: major crops, problems and development",
            "Water resources: irrigation/domestic/industrial; scarcity and conservation",
            "Mineral and energy resources: metallic/non-metallic; conventional/non-conventional",
            "Planning in India: target area planning; sustainable development",
            "Transport and communication networks in India",
            "International trade: patterns; ports/airports and hinterland",
            "Issues: environmental pollution, urban waste disposal, slums, land degradation",
        ],
    },
    "Political Science": {
        "Politics in India Since Independence": [
            "Challenges of Nation-Building",
            "First Three General Elections",
            "Planning and Development",
            "India's Foreign Policy",
            "Emergency: causes and consequences",
            "Rise of Regional Parties",
            "Coalition Era",
            "Democratic upsurge and social movements",
        ],
        "Contemporary World Politics": [
            "Cold War and Bipolarity",
            "End of Bipolarity",
            "US Hegemony",
            "Alternative Centres of Power",
            "South Asia and India-Pak relations",
            "International Organisations (UN, IMF, WTO)",
            "Security challenges",
            "Environment and Globalisation",
        ],
    },
    "Biology": {
        "Reproduction": [
            "Sexual Reproduction in Flowering Plants",
            "Human Reproduction",
            "Reproductive Health",
        ],
        "Genetics and Evolution": [
            "Principles of Inheritance and Variation",
            "Molecular Basis of Inheritance",
            "Evolution",
        ],
        "Biology and Human Welfare": [
            "Human Health and Disease",
            "Microbes in Human Welfare",
        ],
        "Biotechnology and its Applications": [
            "Biotechnology: Principles and Processes",
            "Biotechnology and its Applications",
        ],
        "Ecology and Environment": [
            "Organisms and Populations",
            "Ecosystem",
            "Biodiversity and Conservation",
        ],
    },
    "Chemistry": {
        "General Chemistry": [
            "Equilibrium",
            "Thermodynamics",
            "Chemical Kinetics",
            "Electrochemistry",
            "Solutions (Colligative Properties)",
            "Atomic Structure",
            "Periodic Properties",
        ],
        "Organic Chemistry": [
            "Nomenclature and Structure of Organic Compounds",
            "Hydrocarbons (Alkanes, Alkenes, Alkynes)",
            "Alcohols, Phenols, Ethers",
            "Aldehydes and Ketones",
            "Carboxylic Acids and Derivatives",
            "Amines",
            "Halides",
            "Isomerism",
            "Reaction Mechanisms (E2, SN1, SN2, E1cb)",
            "Reactions of functional groups",
            "Biomolecules (Carbohydrates, Amino Acids, Proteins)",
        ],
        "Inorganic Chemistry": [
            "Coordination Compounds",
            "Transition Metals",
            "Lanthanides and Actinides",
            "Oxidation States",
            "Chemical Bonding in Complexes",
            "Valency in Complexes",
        ],
    },
    "History": {
        "Ancient India - Indus Valley Civilization": [
            "Harappan civilization: key features",
            "Urban planning, drainage, Great Bath",
            "Major sites: Harappa, Mohenjodaro, Dholavira, Lothal, Kalibangan",
            "Economy, trade with Mesopotamia",
            "Artifacts: seals, beads, pottery",
            "Harappan script and writing direction",
            "Theories on decline",
        ],
        "Ancient India - Vedic & Early States": [
            "Rigveda and Vedic society",
            "Varna system and gotra",
            "Mahajanapadas and Magadha",
            "Buddhism: Four Noble Truths, Karma, Nirvana",
            "Jainism basics",
            "Ashoka: Dhamma, inscriptions, spread of Buddhism",
            "Sanchi Stupa",
        ],
        "Post-Maurya to Gupta & Regional Kingdoms": [
            "Indo-Greeks, Kushanas, Satavahanas",
            "Gupta period: polity and culture",
            "Bhakti traditions: Alvar, Naynar",
            "Vijayanagara: dynasties, society, architecture",
        ],
        "Medieval & Early Modern India": [
            "Mughal sources: Ain-i-Akbari, Padshahnama",
            "Mughal land revenue and mansabdari",
            "Travellers: Al-Biruni, Ibn Battuta, Bernier",
            "Sufi and Bhakti movements",
        ],
        "Modern India": [
            "1857 uprising: causes, leaders, spread",
            "British policies: land revenue, tribal movements",
            "Indian National Congress: formation and early phases",
            "Constituent Assembly and Constitution making",
            "Partition themes",
        ],
    },
    "Economics": {
        "Introduction to Microeconomics": [
            "What is microeconomics",
            "Central problems of an economy",
            "Production possibility curve and opportunity cost",
        ],
        "Consumer Behaviour and Demand": [
            "Consumer's Equilibrium: Utility Approach (one and two commodity cases)",
            "Market demand and determinants of demand",
            "Demand schedule and demand curve",
            "Movement along and shifts in demand curve",
            "Price elasticity of demand",
            "Measurement of price elasticity: percentage, total expenditure, geometric methods",
        ],
        "Producer Behaviour and Supply": [
            "Production function: returns to factor and returns to scale",
            "Market supply and determinants of supply",
            "Supply schedule and supply curve",
            "Movement along and shifts in supply curve",
            "Price elasticity of supply: percentage and geometric methods",
            "Concepts of costs: fixed and variable costs",
            "Short-run cost curves: total, average and marginal costs",
            "Concepts of revenue: total, average and marginal revenue",
            "Producer's equilibrium using MC and MR",
        ],
        "Forms of Market and Price Determination": [
            "Forms of market: perfect competition",
            "Price determination under perfect competition",
            "Equilibrium price",
            "Effects of shifts in demand and supply",
        ],
        "Applications of Demand and Supply": [
            "Rationing",
            "Price floors and price ceilings",
            "Food Availability Decline (FAD) Theory",
        ],
        "National Income and Related Aggregates": [
            "Macroeconomics: meaning",
            "Circular flow of income",
            "Concepts of GDP, GNP, NDP, NNP at market price and factor cost",
            "National Disposable Income (gross and net)",
            "Private Income, Personal Income, Personal Disposable Income",
            "Measurement of National Income: Value Added method",
            "Measurement of National Income: Income method",
            "Measurement of National Income: Expenditure method",
        ],
        "Determination of Income and Employment": [
            "Aggregate demand and aggregate supply components",
            "Propensity to consume and propensity to save (APC, MPC, APS, MPS)",
            "Meaning of involuntary unemployment and full employment",
            "Determination of income and employment: two sector model",
            "Investment multiplier and its working",
            "Problems of excess and deficient demand",
            "Measures to correct excess and deficient demand",
        ],
        "Money and Banking": [
            "Money: meaning, evolution and functions",
            "Central bank: meaning and functions",
            "Commercial banks: meaning and functions",
            "Recent reforms in Indian Banking System: privatisation and modernization",
        ],
        "Government Budget and the Economy": [
            "Government budget: meaning and components",
            "Objectives of government budget",
            "Classification of receipts: revenue and capital",
            "Classification of expenditure: revenue and capital, plan and non-plan",
            "Developmental and non-developmental expenditure",
            "Balanced budget, surplus budget, deficit budget: meaning and implications",
            "Revenue deficit, fiscal deficit, primary deficit: meaning and implications",
            "Measures to contain different deficits",
            "Downsizing the role of government: meaning and implications",
        ],
        "Balance of Payments": [
            "Foreign exchange rate: meaning (fixed and flexible)",
            "Merits and demerits of fixed and flexible exchange rates",
            "Determination of exchange rate through demand and supply",
            "Balance of payments accounts: meaning and components",
            "Recent exchange rate issues",
        ],
    },
    "Business Studies": {
        "Nature and Significance of Management": [
            "Management: concept, objectives, importance",
            "Nature of management: Management as Science, Art, Profession",
            "Levels of management: top, middle, supervisory (First level)",
            "Management functions: planning, organising, staffing, directing, controlling",
            "Coordination: nature and importance",
        ],
        "Principles of Management": [
            "Principles of Management: meaning, nature and significance",
            "Fayol's principles of management",
            "Taylor's Scientific Management: Principles and Techniques",
        ],
        "Business Environment": [
            "Business Environment: meaning and importance",
            "Dimensions of Business Environment: Economic, Social, Technological, Political, Legal",
        ],
        "Planning": [
            "Planning: meaning, features, importance, limitations",
            "Planning process",
            "Types of Plans: Objectives, Strategy, Policy, Procedure, Method, Rule, Budget, Programme",
        ],
        "Organising": [
            "Organising: meaning and importance",
            "Steps in the process of organising",
            "Structure of organization: functional and divisional",
            "Formal and informal organisation",
            "Delegation: meaning, elements and importance",
            "Decentralization: meaning and importance",
            "Difference between delegation and decentralisation",
        ],
        "Staffing": [
            "Staffing: meaning, need and importance",
            "Staffing as part of Human Resources Management",
            "Steps in staffing process",
            "Recruitment: meaning and sources",
            "Selection: meaning and process",
            "Training and Development: meaning, need, on-the-job and off-the-job methods",
        ],
        "Directing": [
            "Directing: meaning, importance and principles",
            "Supervision: meaning and importance",
            "Motivation: meaning, importance, Maslow's hierarchy of needs",
            "Financial and non-financial incentives",
            "Leadership: meaning and importance",
            "Communication: meaning, importance, formal and informal",
            "Barriers to effective communication",
        ],
        "Controlling": [
            "Controlling: meaning and importance",
            "Relationship between planning and controlling",
            "Steps in the process of control",
        ],
        "Business Finance": [
            "Business finance: meaning, role, objectives of financial management",
            "Financial planning: meaning and importance",
            "Capital Structure: meaning and factors",
            "Fixed and Working Capital: meaning and factors affecting requirements",
        ],
        "Marketing": [
            "Marketing: meaning, functions, role",
            "Distinction between marketing and selling",
            "Marketing mix: concept and elements",
            "Product: nature, classification, branding, labeling, packaging",
            "Physical distribution: meaning, role, channels of distribution",
            "Promotion: meaning, role, promotion mix, advertising, personal selling",
            "Price: factors influencing pricing",
        ],
        "Consumer Protection": [
            "Importance of consumer protection",
            "Consumer rights",
            "Consumer responsibilities",
            "Consumer awareness and legal redressal",
            "Consumer Protection Act",
            "Role of consumer organizations and NGOs",
        ],
        "Entrepreneurship Development": [
            "Entrepreneurship: concept, functions and need",
            "Entrepreneurship characteristics and competencies",
            "Process of Entrepreneurship Development",
            "Entrepreneurial values, attitudes and motivation",
        ],
    },
    "Accountancy": {
        "Accounting for Partnership": [
            "Nature of Partnership Firm: Partnership deed (meaning, importance)",
            "Final Accounts of Partnership: Fixed vs Fluctuating capital",
            "Division of profit among partners",
            "Profit and Loss Appropriation account",
        ],
        "Reconstitution of Partnership": [
            "Changes in profit sharing ratio among existing partners",
            "Sacrificing ratio and Gaining ratio",
            "Revaluation of Assets and Liabilities",
            "Distribution of reserves and accumulated profits",
            "Goodwill: Nature, factors affecting",
            "Methods of valuation: Average profit, Super profit, Multiplier, Capitalisation",
            "Admission of a Partner: Effect, change in profit sharing ratio",
            "Accounting treatment for goodwill on admission",
            "Retirement/Death of a Partner: Accounting treatment",
        ],
        "Dissolution of Partnership Firm": [
            "Meaning and Settlement of accounts",
            "Preparation of realisation account",
            "Related accounts in dissolution",
        ],
        "Company Accounts - Share Capital": [
            "Share Capital: Meaning, Nature and Types",
            "Issue and Allotment of Equity and Preference Shares",
            "Over subscription and under subscription",
            "Issue at par, premium and at discount",
            "Calls in advance, Calls in arrears",
            "Issue of shares for consideration other than cash",
            "Forfeiture of Shares: Accounting treatment",
            "Re-issue of forfeited shares",
        ],
        "Company Accounts - Debentures": [
            "Issue of Debenture: At par, premium and discount",
            "Issue of debentures for consideration other than cash",
            "Presentation of shares and debentures in balance sheet",
        ],
        "Analysis of Financial Statements": [
            "Financial Statements of a Company: Preparation in prescribed form",
            "Financial Analysis: Meaning, Significance, Purpose, Limitations",
            "Tools for Financial Analysis: Comparative statements, Common size statements",
            "Accounting Ratios: Liquidity, Solvency, Activity, Profitability",
            "Cash Flow Statement: Meaning, Objectives, Preparation",
            "Adjustments: depreciation, dividend, tax, sale/purchase of non-current assets",
        ],
        "Computerised Accounting System": [
            "Overview and Concept of CAS",
            "Features, Advantages, Limitations of CAS",
            "Structure: Chart of accounts, Codification, Hierarchy",
            "Electronic Spreadsheet applications in accounting",
            "Depreciation schedule, Loan repayment, Payroll accounting",
        ],
    },
    "English": {
        "Grammar": ["Tenses", "Voice", "Narration", "Subject-verb agreement"],
        "Vocabulary": ["Synonyms", "Antonyms", "Idioms", "One word substitution"],
        "Comprehension": ["Reading passages", "Inference questions"]
    },
    "Psychology": {
        "Variations in Psychological Attributes": [
            "Individual Differences in Human Functioning",
            "Assessment of Psychological Attributes",
            "Intelligence: Theories of Intelligence",
            "Individual Differences in Intelligence",
            "Culture and Intelligence",
            "Emotional Intelligence",
            "Aptitude: Nature and Measurement",
            "Creativity",
        ],
        "Self and Personality": [
            "Concept of Self",
            "Cognitive and Behavioural Aspects of Self: Self-esteem, Self-efficacy, Self-regulation",
            "Culture and Self",
            "Concept of Personality",
            "Type Approaches to Personality",
            "Trait Approaches to Personality",
            "Psychodynamic Approach",
            "Behavioural Approach",
            "Humanistic Approach",
            "Assessment of Personality: Self-report Measures, Projective Techniques, Behavioural Analysis",
        ],
        "Meeting Life Challenges": [
            "Nature, Types and Sources of Stress",
            "Effects of Stress on Psychological Functioning and Health",
            "General Adaptation Syndrome",
            "Stress and Immune System",
            "Lifestyle and Health",
            "Coping with Stress: Stress Management Techniques",
            "Promoting Positive Health and Well-being",
            "Life Skills",
        ],
        "Psychological Disorders": [
            "Concepts of Abnormality and Psychological Disorders",
            "Classification of Psychological Disorders",
            "Factors Underlying Abnormal Behaviour",
            "Anxiety Disorders",
            "Obsessive-Compulsive and Related Disorders",
            "Trauma and Stressor Related Disorders",
            "Dissociative Disorders",
            "Depressive Disorders",
            "Bipolar and Related Disorders",
            "Schizophrenia Spectrum Disorders",
            "Substance-Related and Addictive Disorders",
        ],
        "Therapeutic Approaches": [
            "Nature and Process of Psychotherapy",
            "Therapeutic Relationship",
            "Behaviour Therapy",
            "Cognitive Therapy",
            "Humanistic-existential Therapy",
            "Factors Contributing to Healing in Psychotherapy",
            "Ethics in Psychotherapy",
            "Rehabilitation of the Mentally Ill",
        ],
        "Attitude and Social Cognition": [
            "Explaining Social Behaviour",
            "Nature and Components of Attitudes",
            "Attitude Formation and Change",
            "Prejudice and Discrimination",
            "Strategies for Handling Prejudice",
        ],
        "Social Influence and Group Processes": [
            "Nature and Formation of Groups",
            "Types of Groups",
            "Influence of Group on Individual Behaviour",
            "Social Loafing",
            "Group Polarization",
        ],
    },
    "Computer Science": {
        "Database Concepts": [
            "Introduction to database concepts",
            "Difference between database and file system",
            "Relational data model: domain, tuple, relation",
            "Keys: candidate key, primary key, alternate key, foreign key",
            "Relational algebra: selection, projection, union, set difference, cartesian product",
        ],
        "Structured Query Language": [
            "Data Definition Language (DDL): CREATE TABLE, DROP TABLE, ALTER TABLE",
            "Data Query Language (DQL): SELECT, FROM, WHERE",
            "Data Manipulation Language (DML): INSERT, UPDATE, DELETE",
            "Math functions: POWER(), ROUND(), MOD()",
            "Text functions: UCASE(), LCASE(), MID(), SUBSTRING(), LENGTH(), LEFT(), RIGHT(), INSTR(), TRIM()",
            "Date Functions: NOW(), DATE(), MONTH(), MONTHNAME(), YEAR(), DAY(), DAYNAME()",
            "Aggregate Functions: MAX(), MIN(), AVG(), SUM(), COUNT()",
            "GROUP BY, HAVING, ORDER BY clauses",
            "Operations on Relations: Union, Intersection, Minus, Cartesian Product, JOIN",
        ],
        "Exception and File Handling in Python": [
            "Exception Handling: syntax errors vs exceptions",
            "Try-except-else clause, Try-finally clause",
            "Built-in exception classes, user-defined exceptions",
            "Raising and catching exceptions",
            "File Handling: text file and binary file",
            "File access modes, open and close files",
            "Reading and writing text files",
            "Reading and writing binary files using pickle module",
        ],
        "Stack": [
            "Introduction to stack (LIFO Operations)",
            "Operations on stack: PUSH and POP implementation in Python",
            "Expressions in Prefix, Infix and Postfix notations",
            "Evaluating arithmetic expressions using stack",
            "Conversion of Infix expression to Postfix expression",
        ],
        "Queue": [
            "Introduction to Queue (FIFO)",
            "Operations on Queue: INSERT and DELETE implementation in Python",
            "Introduction to DQueue (Double-ended Queue) and its implementation",
        ],
        "Searching": [
            "Sequential search algorithm",
            "Binary search algorithm",
            "Analysis: best, worst and average cases",
            "Implementation of searching techniques in Python",
        ],
        "Sorting": [
            "Bubble Sort algorithm and implementation",
            "Selection Sort algorithm and implementation",
            "Insertion Sort algorithm and implementation",
            "Analysis: best, worst and average cases",
            "Hashing: Hash Functions, Collision Resolution",
        ],
        "Computer Networks": [
            "Network types: LAN, WAN, MAN",
            "Network devices: Modem, Ethernet Card, Repeater, Hub, Switch, Router, Gateway",
            "Network Topologies: Mesh, Ring, Bus, Star, Tree",
            "MAC and IP Address concepts",
            "Difference between Internet and Web",
            "Communication Media: Twisted pair, Coaxial, Optical Fibre",
            "Wireless Technologies: Bluetooth, WLAN, Infrared, Microwave",
            "Network Protocols: HTTP, FTP, IP, PPP",
        ],
        "Security Aspects": [
            "Threats: Viruses, Worms, Trojan horse, Spam, Adware",
            "Firewall, HTTP vs HTTPS",
            "Network Security: Hackers and Crackers, Cookies",
            "Antivirus and their workings",
            "Network threats: Denial of service, Intrusion, Snooping, Eavesdropping",
        ],
        "Data Handling using Pandas": [
            "Series: Creation, mathematical operations, indexing, slicing",
            "DataFrames: Creation from dictionary, CSV files",
            "Operations on rows and columns: add, select, delete, rename",
            "Boolean Indexing, Joining, Merging, Concatenation",
            "Descriptive Statistics: mean, median, mode, standard deviation, variance",
            "Handling missing values: dropping and filling",
        ],
        "Plotting Data using Matplotlib": [
            "Line plot, Bar graph, Histogram",
            "Pie chart, Scatter plot, Box plot",
            "Customizing plots: color, style, width, labels, title, legend",
        ],
    },
    "General Aptitude Test": {
        "Logical Reasoning": ["Series completion", "Coding-decoding", "Analogies", "Blood relations"],
        "Quantitative Aptitude": ["Percentages", "Profit and loss", "Time and work", "Averages"],
        "Data Interpretation": ["Tables", "Graphs", "Charts"]
    },
    "Applied Mathematics": {
        "Numbers, Quantification and Numerical Applications": [
            "Modulo Arithmetic: modulus of an integer, arithmetic operations using modular rules",
            "Congruence Modulo: definition and application in problems",
            "Allegation and Mixture: rule of allegation, mean price of mixtures",
            "Numerical Problems: boats and streams, pipes and cisterns, races and games, partnership",
            "Numerical Inequalities: graphical and algebraic solutions",
        ],
        "Algebra (Matrices and Determinants)": [
            "Types of matrices: row, column, rectangular, square, diagonal, scalar, identity, zero",
            "Equality of matrices, transpose, symmetric and skew-symmetric matrices",
            "Algebra of matrices: addition, subtraction, scalar multiplication, matrix multiplication",
            "Determinants of order 2 and 3, properties of determinants",
            "Inverse of a matrix using adjoint method",
            "Solving system of simultaneous linear equations using Cramer's rule and matrix method",
        ],
        "Calculus": [
            "Higher order derivatives: second-order derivatives",
            "Marginal cost and marginal revenue using derivatives",
            "Maxima and minima: increasing and decreasing functions, critical points",
            "Integration as reverse process of differentiation",
            "Indefinite integrals: basic formulae, integration by substitution",
            "Definite integrals as limit of a sum, fundamental theorem of calculus",
            "Application of integration: demand and supply functions, consumer surplus, producer surplus",
            "Differential equations: order and degree, variable separable method, linear differential equations",
        ],
        "Probability Distributions": [
            "Probability distribution of a random variable: mean and variance",
            "Binomial distribution: mean (np) and variance (npq)",
            "Mathematical expectation",
            "Repeated independent (Bernoulli) trials",
        ],
        "Index Numbers and Time-Based Data": [
            "Index numbers: meaning, types (price, quantity, value), uses and limitations",
            "Construction of index numbers: aggregative and average of price relatives method",
            "Tests of adequacy: time reversal test, factor reversal test",
            "Time series: meaning, components (secular trend, seasonal, cyclical, irregular)",
            "Calculation of trend by moving average method",
        ],
        "Inferential Statistics": [
            "Population and sample, parameter and statistic",
            "Measures of central tendency and dispersion (revision)",
            "Statistical significance and hypothesis testing (basic concepts)",
            "t-test (basic idea), chi-square test (basic idea)",
        ],
        "Financial Mathematics": [
            "Perpetuity: meaning and calculation",
            "Sinking funds: meaning and formula",
            "Valuation of bonds: present value approach",
            "EMI calculation using flat-rate and reducing-balance method",
            "Depreciation: linear method (straight line) and non-linear (written-down value)",
            "Taxation: basic concepts of GST and Income Tax computation",
        ],
        "Linear Programming": [
            "Introduction and formulation of Linear Programming Problems (LPP)",
            "Graphical method of solution for two-variable LPP",
            "Feasible and infeasible regions, bounded and unbounded",
            "Optimal solution: corner point method",
        ],
    }
}


class QuestionGenerator:
    """Generate CUET-style MCQ questions using Gemini 2.5 Flash"""
    
    def __init__(self):
        # Prefer a user-provided Gemini key if present, otherwise fall back to Emergent universal key
        self.api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
        if not self.api_key:
            logger.warning("No LLM key found (GEMINI_API_KEY/EMERGENT_LLM_KEY) - AI generation disabled")
    
    async def _generate_with_google_sdk(self, prompt: str) -> Optional[str]:
        """Generate with official Google GenAI SDK when GEMINI_API_KEY is present."""
        if not os.environ.get("GEMINI_API_KEY"):
            return None

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

            preferred = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
            models_to_try = (
                [preferred, "gemini-2.5-pro"]
                if preferred != "gemini-2.5-pro"
                else [preferred]
            )

            last_err = None
            for model in models_to_try:
                try:
                    resp = await asyncio.to_thread(
                        client.models.generate_content,
                        model=model,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            response_json_schema={
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "required": ["question_text", "options", "explanation", "topic", "has_diagram", "diagram_ascii"],
                                    "properties": {
                                        "question_text": {"type": "string"},
                                        "diagram_ascii": {"type": ["string", "null"]},
                                        "options": {
                                            "type": "array",
                                            "minItems": 4,
                                            "maxItems": 4,
                                            "items": {
                                                "type": "object",
                                                "required": ["label", "text", "is_correct"],
                                                "properties": {
                                                    "label": {"type": "string"},
                                                    "text": {"type": "string"},
                                                    "is_correct": {"type": "boolean"}
                                                }
                                            }
                                        },
                                        "explanation": {"type": "string"},
                                        "topic": {"type": "string"},
                                        "has_diagram": {"type": "boolean"}
                                    }
                                }
                            },
                            temperature=0.6,
                            top_p=0.9,
                        ),
                    )
                    return resp.text
                except Exception as e:
                    last_err = e
                    continue

            logger.error(f"Google SDK generation failed: {last_err}")
            return None

        except Exception as e:
            logger.error(f"Google SDK init failed: {e}")
            return None

    async def generate_questions(
        self,
        subject: str,
        chapter: str,
        topics: List[str],
        count: int = 5,
        difficulty: DifficultyLevel = DifficultyLevel.MEDIUM,
        avoid_question_texts: Optional[List[str]] = None,
    ) -> List[Question]:
        """Generate MCQ questions for given subject, chapter, and topics using Gemini."""
        
        if not self.api_key:
            logger.warning("No API key - returning empty list")
            return []
        
        try:
            has_emergent = False
            try:
                from emergentintegrations.llm.chat import LlmChat, UserMessage
                has_emergent = True
            except ImportError:
                pass

            logger.info(f"LLM generate_questions subject={subject} chapter={chapter} count={count} diff={difficulty.value} using_google_sdk={bool(os.environ.get('GEMINI_API_KEY'))}")

            # Add subject-specific context to help generate syllabus-aligned questions
            syllabus = SUBJECT_SYLLABUS.get(subject, {})
            syllabus_text = "\n".join(
                [
                    f"- {ch}: {', '.join(tps)}"
                    for ch, tps in list(syllabus.items())[:12]
                ]
            )

            sample_style_notes = ""
            if subject == "Mathematics":
                sample_style_notes = (
                    "Maths sample-paper style notes: mix conceptual + computation; calculus (differentiation/integration/differential equations) is frequent; "
                    "matrices/determinants and probability distributions appear often; sometimes use match-the-following and assertion-reason."
                )
            elif subject == "Physics":
                sample_style_notes = (
                    "Physics sample-paper style notes: frequent electrostatics/current electricity/magnetism/EMI/AC/optics/modern physics; "
                    "mix numeric problems and conceptual statements; use standard CUET phrasing and plausible distractors."
                )
            elif subject == "Chemistry":
                sample_style_notes = (
                    "Chemistry sample-paper style notes: mix concept + numericals; include statement-based questions, match-the-following, reaction mechanism/reagent selection, "
                    "and property-based trends. Keep options close and plausible, slightly tougher than sample PDFs."
                )
            elif subject == "History":
                sample_style_notes = (
                    "History sample-paper style notes: include passage-based questions, assertion-reason, match-the-following, and chronological ordering. "
                    "Mix direct factual recall with interpretation of sources/themes (polity, economy, culture). Slightly tougher than sample PDFs."
                )
            elif subject == "Biology":
                sample_style_notes = (
                    "Biology CUET style notes: NCERT-aligned statements; mix conceptual + factual + application; include diagram-based identification, labelling, flowcharts (pathways/cycles), "
                    "genetics crosses, and match-the-following. Slightly tougher than sample PDFs but not beyond syllabus."
                )
            elif subject == "Economics":
                sample_style_notes = (
                    "Economics CUET style notes: mix conceptual + numerical + application; include GDP/GNP calculations, multiplier problems, elasticity computations, "
                    "match-the-following (types of goods, market forms, budget components), assertion-reason questions, passage-based questions on economic policies. "
                    "Cover both Micro (consumer equilibrium, demand-supply, costs) and Macro (national income, money & banking, government budget, BoP). "
                    "Include diagrams: demand-supply curves, cost curves (ATC, AVC, MC), circular flow of income, PPC. Slightly tougher than sample PDFs."
                )
            elif subject == "Geography":
                sample_style_notes = (
                    "Geography CUET style notes: mix conceptual + factual + map-based; include questions on population distribution, human activities (primary/secondary/tertiary), "
                    "transport networks (rail/road/water/air routes), international trade patterns, and India-specific topics. "
                    "Include match-the-following (crops-regions, minerals-states, ports-hinterlands), assertion-reason, passage-based on development/urbanization issues. "
                    "Cover both Fundamentals of Human Geography and India: People and Economy. Include ASCII diagrams for maps, trade routes, and settlement patterns where relevant."
                )
            elif subject == "Business Studies":
                sample_style_notes = (
                    "Business Studies CUET style notes: mix conceptual + application-based; include questions on management principles (Fayol's 14 principles, Taylor's Scientific Management), "
                    "organizational structures, staffing process, motivation theories (Maslow's hierarchy), marketing mix (4Ps), financial management concepts. "
                    "Include match-the-following (principles-authors, functions-examples), assertion-reason, case-based questions on business scenarios. "
                    "Cover management functions, business environment, consumer protection, and entrepreneurship. Include diagrams for organizational charts and planning hierarchy where relevant."
                )
            elif subject == "Accountancy":
                sample_style_notes = (
                    "Accountancy CUET style notes: mix conceptual + numerical + journal entries; include questions on partnership accounting (profit sharing, goodwill valuation, admission/retirement), "
                    "company accounts (share issue, forfeiture, debentures), financial statement analysis (ratios, cash flow). "
                    "Include calculation-based questions (goodwill methods, ratio calculations, journal entries), match-the-following (ratios-formulas, accounts-types). "
                    "Cover partnership reconstitution, dissolution, share capital, debentures, and financial analysis. Include T-account diagrams and journal entry formats where relevant."
                )
            elif subject == "Psychology":
                sample_style_notes = (
                    "Psychology CUET style notes: mix conceptual + application-based; include questions on intelligence theories (Spearman, Gardner, Sternberg), personality approaches (psychodynamic, trait, humanistic), "
                    "psychological disorders (anxiety, mood, schizophrenia), therapeutic approaches (CBT, behaviour therapy), stress and coping (GAS model), social psychology (attitudes, prejudice, group processes). "
                    "Include match-the-following (theorists-theories, disorders-symptoms), assertion-reason, case-based questions on psychological concepts. "
                    "Cover individual differences, self and personality, life challenges, disorders, therapies, and social influence."
                )
            elif subject == "Computer Science":
                sample_style_notes = (
                    "Computer Science CUET style notes: mix conceptual + code-based + output prediction; include questions on SQL queries (DDL, DML, DQL), Python file handling, "
                    "data structures (stack LIFO, queue FIFO operations), searching (sequential, binary), sorting (bubble, selection, insertion), complexity analysis. "
                    "Include code output prediction, SQL query results, match-the-following (functions-outputs, network devices-functions), assertion-reason. "
                    "Cover database concepts, exception handling, Pandas operations, Matplotlib plotting, network topologies, and security threats. Include ASCII diagrams for stack/queue operations."
                )
            elif subject == "Applied Mathematics":
                sample_style_notes = (
                    "Applied Mathematics CUET style notes: mix conceptual + numerical + real-world application; include questions on modular arithmetic, allegation/mixture problems, "
                    "matrix operations (addition, multiplication, inverse, determinants, Cramer's rule), calculus (marginal cost/revenue, maxima-minima, consumer/producer surplus via integration), "
                    "probability distributions (binomial distribution, expectation), index numbers (construction methods, time/factor reversal tests), time series (trend by moving average), "
                    "financial mathematics (EMI, depreciation, sinking funds, bond valuation, GST/Income Tax), and linear programming (graphical method, corner-point optimal solution). "
                    "Include match-the-following (formulas-concepts, methods-applications), assertion-reason, and case-based questions on real-world financial/business scenarios. "
                    "Include ASCII diagrams for LP graphs (feasible region, corner points) and demand-supply curves where relevant."
                )

            chat = None
            if has_emergent:
                chat = LlmChat(
                    api_key=self.api_key,
                    session_id=f"question_gen_{uuid.uuid4()}",
                    system_message="""You are an expert CUET exam question creator. You create high-quality, challenging MCQ questions that:
1. Test conceptual understanding, not just memorization
2. Have exactly 4 options (A, B, C, D) with only ONE correct answer
3. Include subtle conceptual traps in incorrect options — plausible distractors are key
4. Cover the exact syllabus topics provided — distribute questions evenly across ALL listed topics
5. Match the difficulty level specified
6. Include mathematical formulas using proper notation (use Unicode for symbols like √, π, ², etc.)
7. Difficulty: slightly tougher than typical sample PDFs; include multi-concept traps
8. Vary question formats: at least 10% assertion-reason, 10% match-the-following style, 5% case/passage-based, and the rest standard MCQs
9. Explanations: Always provide a concise explanation field. It will be shown only after submission.

For HARD questions: Include multi-step problems, conceptual traps, and require deep understanding. Combine 2+ concepts.
For MEDIUM questions: Standard application problems with moderate complexity. Single concept with a twist.
For EASY questions: Direct formula application or basic concept recall. Straightforward.

IMPORTANT FOR DIAGRAM QUESTIONS:
- When a question involves geometry, graphs, coordinate geometry, circuits, biological diagrams, or data visualization, include a detailed ASCII art diagram ONLY in diagram_ascii.
- For science subjects (Physics, Chemistry, Biology), aim for at least 3 diagram questions per 10 questions.
- For Mathematics/Applied Mathematics, include diagrams for LP graphs, curves, coordinate geometry (at least 2 per 10).
- Do NOT describe the diagram in prose — ASCII only.
- Use clear labels and measurements in ASCII diagrams.

CHAPTER DIVERSITY RULE: You MUST spread questions across ALL topics listed, not cluster them on one or two topics. If 5 topics are given, each should get roughly equal representation."""
                ).with_model("gemini", "gemini-2.5-flash")

            # Encourage CUET-style output and avoid copying the sample questions verbatim
            # (we only use sample patterns for style guidance)
            
            difficulty_guidance = {
                DifficultyLevel.EASY: "Direct application of formulas, basic conceptual questions",
                DifficultyLevel.MEDIUM: "Multi-step problems requiring 2-3 concepts",
                DifficultyLevel.HARD: "Complex problems with conceptual traps, requiring deep understanding"
            }
            
            prompt = f"""Generate {count} unique MCQ questions for CUET {subject} exam.

Syllabus context (high level):
{syllabus_text}

Style guidance:
{sample_style_notes}

Subject: {subject}
Chapter: {chapter}
Topics to cover (SPREAD questions evenly across these): {', '.join(topics)}
Difficulty Level: {difficulty.value.upper()} - {difficulty_guidance.get(difficulty, '')}

QUESTION FORMAT MIX (mandatory):
- ~60% standard MCQs (conceptual + numerical)
- ~15% assertion-reason format ("Assertion (A): ... Reason (R): ...")
- ~15% match-the-following / list-based ("Match Column I with Column II")
- ~10% case/passage-based (short scenario then question)

DIAGRAM RULES:
- For science subjects (Physics, Chemistry, Biology): include ASCII diagrams in at least 30% of questions (circuits, structures, graphs, flowcharts)
- For Mathematics/Applied Mathematics: include diagrams for graphs, coordinate geometry, LP feasible regions (~20% of questions)
- Set has_diagram=true and diagram_ascii MUST be non-null with a clear ASCII diagram
- If no diagram needed: has_diagram=false and diagram_ascii=null
- Only ASCII art; avoid backslashes (\\). Use /, |, -, _, = instead.

Avoid list (do NOT repeat/paraphrase these):
{chr(10).join(['- ' + t[:180] for t in (avoid_question_texts or [])][:25])}

IMPORTANT RULES:
1. Each question must have exactly 4 options labeled A, B, C, D
2. Only ONE option should be correct
3. Options should be plausible and test real understanding — close distractors
4. Include numerical problems where applicable
5. Use proper mathematical notation (√, π, ², ∫, etc.)
6. Questions should match CUET exam pattern and difficulty
7. Do NOT include solutions inside question_text. Put solutions only in explanation.
8. Do NOT copy sample questions verbatim; create original questions using the same style.
9. TOPIC DIVERSITY: spread questions evenly across ALL listed topics. Do NOT cluster on one topic.
10. CUET domain subjects are 50 MCQs (students attempt 40); still generate 50 as asked.

Respond ONLY with a valid JSON array.
- No markdown fences
- No trailing commas
- Use double quotes for all keys/strings

Each array item MUST be an object with keys:
- question_text: string
- diagram_ascii: string or null
- has_diagram: boolean
- topic: string (must match one of the topics listed above)
- explanation: string
- options: array of EXACTLY 4 objects

Each options item MUST have keys:
- label: one of "A","B","C","D"
- text: string
- is_correct: boolean (exactly ONE option true per question)

Generate exactly {count} questions.
Return only JSON.
"""

            # Prefer official Google SDK when GEMINI_API_KEY is present (more reliable than litellm routing)
            response = await self._generate_with_google_sdk(prompt)

            if response is None:
                if has_emergent:
                    user_message = UserMessage(text=prompt)
                    response = await chat.send_message(user_message)
                else:
                    logger.error("Google SDK failed and emergent fallback is disabled.")
                    return []

            # Parse JSON response (strip code fences + handle minor pre/post text)
            json_str = response.strip()
            if json_str.startswith("```json"):
                json_str = json_str[7:]
            if json_str.startswith("```"):
                json_str = json_str[3:]
            if json_str.endswith("```"):
                json_str = json_str[:-3]

            json_str = json_str.strip()
            # If model wrapped JSON with extra text, attempt to extract the first JSON array
            if not json_str.startswith('['):
                start = json_str.find('[')
                end = json_str.rfind(']')
                if start != -1 and end != -1 and end > start:
                    json_str = json_str[start:end+1]

            # If model returned a JSON object with a "questions" key, unwrap it
            if json_str.startswith('{'):
                try:
                    obj = json.loads(json_str)
                    if isinstance(obj, dict) and isinstance(obj.get('questions'), list):
                        json_str = json.dumps(obj['questions'])
                except Exception:
                    pass

            # Try parsing; if it fails, do a single regeneration with a stricter instruction
            try:
                # Sanitize any raw control characters that can break JSON parsing.
                json_str = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", json_str)
                questions_data = json.loads(json_str)
            except json.JSONDecodeError:
                strict_prompt = prompt + "\n\nRESPONSE FORMAT: Output MUST be valid JSON only (no trailing commas, no unterminated strings)."
                response2 = await self._generate_with_google_sdk(strict_prompt)
                if response2 is None:
                    if has_emergent:
                        user_message = UserMessage(text=strict_prompt)
                        response2 = await chat.send_message(user_message)
                    else:
                        logger.error("Google SDK failed second time (strict prompt).")
                        return []
                json_str = response2.strip()
                if json_str.startswith("```json"):
                    json_str = json_str[7:]
                if json_str.startswith("```"):
                    json_str = json_str[3:]
                if json_str.endswith("```"):
                    json_str = json_str[:-3]
                json_str = json_str.strip()
                if not json_str.startswith('['):
                    start = json_str.find('[')
                    end = json_str.rfind(']')
                    if start != -1 and end != -1 and end > start:
                        json_str = json_str[start:end+1]
                json_str = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", json_str)
                questions_data = json.loads(json_str)

            # From here on, questions_data is loaded
            
            questions = []
            for q_data in questions_data:

                # Basic shape validation/repair
                if "question_text" not in q_data or "options" not in q_data:
                    continue

                raw_options = q_data.get("options") or []
                # Ensure exactly 4 options
                if len(raw_options) != 4:
                    continue

                # Basic diagram normalization
                has_diagram = bool(q_data.get("has_diagram", False))
                diagram_ascii = (
                    str(q_data.get("diagram_ascii")).rstrip()
                    if q_data.get("diagram_ascii")
                    else None
                )

                # If the model provided an ASCII diagram, treat it as having a diagram
                if diagram_ascii and not has_diagram:
                    has_diagram = True

                # If model flagged diagram but forgot content, drop the flag
                if has_diagram and not diagram_ascii:
                    has_diagram = False

                options: List[QuestionOption] = []
                correct_option_id: Optional[str] = None
                correct_count = 0

                for opt in raw_options:
                    opt_id = str(uuid.uuid4())
                    is_correct = bool(opt.get("is_correct", False))
                    if is_correct:
                        correct_count += 1
                    options.append(
                        QuestionOption(
                            id=opt_id,
                            text=str(opt.get("text", "")).strip(),
                            is_correct=is_correct,
                        )
                    )
                    if is_correct and correct_option_id is None:
                        correct_option_id = opt_id

                # Enforce exactly ONE correct option
                if correct_count != 1:
                    # Repair: force first option as correct, others false
                    for i, o in enumerate(options):
                        o.is_correct = i == 0
                    correct_option_id = options[0].id

                question = Question(
                    subject=subject,
                    chapter=chapter,
                    topic=q_data.get("topic", topics[0] if topics else chapter),
                    question_text=str(q_data["question_text"]).strip(),
                    options=options,
                    correct_option_id=correct_option_id or options[0].id,
                    explanation=str(q_data.get("explanation", "Solution not available.")).strip(),
                    difficulty=difficulty,
                    has_diagram=has_diagram,
                    diagram_ascii=(
                        str(q_data.get("diagram_ascii")).rstrip()
                        if q_data.get("diagram_ascii")
                        else None
                    ),
                    diagram_description=None,
                )
                questions.append(question)
            
            # De-duplication pass for this batch (avoid near-identical paraphrases)
            seen_norms = set()
            deduped: List[Question] = []
            for q in questions:
                n = _normalize_question_text(q.question_text)
                if n in seen_norms:
                    continue
                seen_norms.add(n)
                deduped.append(q)
            
            logger.info(f"Generated {len(deduped)} questions for {subject}/{chapter}")
            return deduped
            
        except json.JSONDecodeError as e:
            # If JSON parse fails, attempt one regeneration by re-asking for strict JSON
            logger.error(f"JSON parsing error: {e}. First 200 chars: {json_str[:200]!r}")
            return []
        except Exception as e:
            logger.error(f"Question generation error: {e}")
            return []
    
    async def generate_mock_test_questions(
        self,
        subject: str,
        total_questions: int = 50
    ) -> List[Question]:
        """Generate a full mock test with proper difficulty distribution."""
        
        syllabus = SUBJECT_SYLLABUS.get(subject, {})
        if not syllabus:
            logger.warning(f"No syllabus found for {subject}")
            return []
        
        # Difficulty distribution: 20% easy, 30% medium, 50% hard
        easy_count = int(total_questions * 0.20)
        medium_count = int(total_questions * 0.30)
        hard_count = total_questions - easy_count - medium_count

        desired_counts = {
            DifficultyLevel.EASY: easy_count,
            DifficultyLevel.MEDIUM: medium_count,
            DifficultyLevel.HARD: hard_count,
        }

        chapters = list(syllabus.keys())
        # Round-robin distribution across chapters to cover breadth
        chapter_cycle = chapters.copy()
        random.shuffle(chapter_cycle)

        # Calculate per-chapter target for even distribution
        questions_per_chapter = max(2, total_questions // len(chapters))

        all_questions: List[Question] = []
        seen_norms: set[str] = set()
        avoid_texts: List[str] = []

        # Hard cap to avoid runaway generation
        max_total_calls = 25
        total_calls = 0

        for diff in [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD]:
            remaining = desired_counts[diff]
            idx = 0
            while remaining > 0 and total_calls < max_total_calls:
                chapter = chapter_cycle[idx % len(chapter_cycle)]
                topics = syllabus[chapter]
                batch = min(10, remaining)  # balance latency vs JSON reliability

                qs = await self.generate_questions(
                    subject=subject,
                    chapter=chapter,
                    topics=random.sample(topics, min(len(topics), 4)),
                    count=batch,
                    difficulty=diff,
                    avoid_question_texts=avoid_texts,
                )

                total_calls += 1


                # Cross-batch de-duplication
                added = 0
                for q in qs:
                    n = _normalize_question_text(q.question_text)
                    if n in seen_norms:
                        continue
                    seen_norms.add(n)
                    avoid_texts.append(q.question_text)
                    all_questions.append(q)
                    added += 1

                remaining -= added
                idx += 1

                # Small delay to avoid rate limiting
                await asyncio.sleep(0.2)

                # If model keeps failing for a diff, break to avoid infinite loops
                if idx > (len(chapter_cycle) * 4) and remaining == desired_counts[diff]:
                    break

        # If we still couldn't reach the target count, do a couple of best-effort fill passes
        if len(all_questions) < total_questions:
            fill_needed = total_questions - len(all_questions)
            for _ in range(2):
                if fill_needed <= 0:
                    break
                chapter = random.choice(chapters)
                topics = syllabus[chapter]
                qs = await self.generate_questions(
                    subject=subject,
                    chapter=chapter,
                    topics=random.sample(topics, min(len(topics), 4)),
                    count=min(10, fill_needed),
                    difficulty=DifficultyLevel.MEDIUM,
                    avoid_question_texts=avoid_texts,
                )

                for q in qs:
                    n = _normalize_question_text(q.question_text)
                    if n in seen_norms:
                        continue
                    seen_norms.add(n)
                    avoid_texts.append(q.question_text)
                    all_questions.append(q)

                fill_needed = total_questions - len(all_questions)
                await asyncio.sleep(0.2)

        random.shuffle(all_questions)
        return all_questions[:total_questions]


# Sample fallback questions for each subject
SAMPLE_QUESTIONS = {
    "Physics": [
        {
            "chapter": "Electrostatics",
            "topic": "Electric field",
            "question_text": "An infinitely long wire is charged uniformly with charge density λ. The electric field at distance r from the wire is:",
            "options": [
                {"text": "λ/(2πε₀r)", "is_correct": True},
                {"text": "λ/(4πε₀r)", "is_correct": False},
                {"text": "λ/(2πr)", "is_correct": False},
                {"text": "λ/(4πr)", "is_correct": False}
            ],
            "explanation": "Using Gauss's Law for an infinitely long charged wire, the electric field at distance r is E = λ/(2πε₀r).",
            "difficulty": "medium"
        },
        {
            "chapter": "Electromagnetic Induction",
            "topic": "Eddy currents",
            "question_text": "Why is the iron core of a transformer made laminated instead of being in one solid piece?",
            "options": [
                {"text": "To reduce the magnetic field link losses", "is_correct": False},
                {"text": "To reduce the loss due to heating of coils", "is_correct": False},
                {"text": "To reduce the hysteresis losses", "is_correct": False},
                {"text": "To reduce the losses due to eddy currents", "is_correct": True}
            ],
            "explanation": "Lamination breaks up large conductive sheets, increasing resistance and reducing eddy currents which cause energy loss as heat.",
            "difficulty": "easy"
        },
        {
            "chapter": "Electronic Devices",
            "topic": "Rectifiers",
            "question_text": "A 50 Hz AC is rectified with full wave rectifier. What is the output frequency?",
            "options": [
                {"text": "100 Hz", "is_correct": True},
                {"text": "50 Hz", "is_correct": False},
                {"text": "200 Hz", "is_correct": False},
                {"text": "25 Hz", "is_correct": False}
            ],
            "explanation": "In a full-wave rectifier, output frequency is twice the input: 2 × 50 = 100 Hz.",
            "difficulty": "easy"
        }
    ],
    "Mathematics": [
        {
            "chapter": "Probability",
            "topic": "Basic probability",
            "question_text": "Five horses are in a race. Mr. A selects two horses at random. The probability that Mr. A selected the winning horse is:",
            "options": [
                {"text": "1/5", "is_correct": False},
                {"text": "2/5", "is_correct": True},
                {"text": "3/5", "is_correct": False},
                {"text": "4/5", "is_correct": False}
            ],
            "explanation": "Mr. A selects 2 out of 5 horses. P(winning horse selected) = 2/5.",
            "difficulty": "easy"
        },
        {
            "chapter": "Differential Equations",
            "topic": "Order and degree",
            "question_text": "The order and degree of the differential equation d²y/dx² - dy/dx + y = eˣ sin x are:",
            "options": [
                {"text": "Second order, first degree", "is_correct": True},
                {"text": "Third order, second degree", "is_correct": False},
                {"text": "First order, second degree", "is_correct": False},
                {"text": "Second order, second degree", "is_correct": False}
            ],
            "explanation": "Highest derivative is d²y/dx² (second order). Each derivative has power 1 (first degree).",
            "difficulty": "medium"
        },
        {
            "chapter": "Integration",
            "topic": "Indefinite integrals",
            "question_text": "Find ∫(6x⁵ + 6)dx:",
            "options": [
                {"text": "x⁶ + 6x + C", "is_correct": True},
                {"text": "x⁵ + 6x + C", "is_correct": False},
                {"text": "1.5x⁶ + 6x + C", "is_correct": False},
                {"text": "6x⁶ + 6x + C", "is_correct": False}
            ],
            "explanation": "∫6x⁵dx = x⁶ and ∫6dx = 6x. Result: x⁶ + 6x + C.",
            "difficulty": "easy"
        },
        {
            "chapter": "Matrices and Determinants",
            "topic": "Matrix properties",
            "question_text": "The number of all possible matrices of order 3×3 with each entry 0 or 1 is:",
            "options": [
                {"text": "81", "is_correct": False},
                {"text": "512", "is_correct": True},
                {"text": "18", "is_correct": False},
                {"text": "27", "is_correct": False}
            ],
            "explanation": "A 3×3 matrix has 9 entries. Each entry has 2 choices (0 or 1). Total = 2⁹ = 512.",
            "difficulty": "easy"
        },
        {
            "chapter": "Linear Programming",
            "topic": "Optimization",
            "question_text": "Find the maximum value of Z = 3x + 4y subject to constraints x ≥ 0, y ≥ 0, x + y ≤ 4:",
            "options": [
                {"text": "16", "is_correct": True},
                {"text": "12", "is_correct": False},
                {"text": "7", "is_correct": False},
                {"text": "14", "is_correct": False}
            ],
            "explanation": "Corner points: (0,0), (4,0), (0,4). Z values: 0, 12, 16. Maximum = 16 at (0,4).",
            "difficulty": "medium"
        }
    ],
    "Chemistry": [
        {
            "chapter": "Chemical Bonding",
            "topic": "VSEPR Theory",
            "question_text": "According to VSEPR theory, the shape of SF₆ molecule is:",
            "options": [
                {"text": "Tetrahedral", "is_correct": False},
                {"text": "Square planar", "is_correct": False},
                {"text": "Octahedral", "is_correct": True},
                {"text": "Trigonal bipyramidal", "is_correct": False}
            ],
            "explanation": "SF₆ has 6 bonding pairs and no lone pairs, resulting in octahedral geometry.",
            "difficulty": "easy"
        }
    ],
    "English": [
        {
            "chapter": "Grammar",
            "topic": "Tenses",
            "question_text": "Choose the correct form: 'By next year, she _____ her degree.'",
            "options": [
                {"text": "will complete", "is_correct": False},
                {"text": "will have completed", "is_correct": True},
                {"text": "would complete", "is_correct": False},
                {"text": "has completed", "is_correct": False}
            ],
            "explanation": "Future Perfect tense is used for an action completed before a specific future time.",
            "difficulty": "easy"
        },
        {
            "chapter": "Vocabulary",
            "topic": "Synonyms",
            "question_text": "Choose the word most similar in meaning to 'Ubiquitous':",
            "options": [
                {"text": "Rare", "is_correct": False},
                {"text": "Omnipresent", "is_correct": True},
                {"text": "Hidden", "is_correct": False},
                {"text": "Unique", "is_correct": False}
            ],
            "explanation": "Ubiquitous means present everywhere, synonymous with omnipresent.",
            "difficulty": "medium"
        }
    ],
    "General Aptitude Test": [
        {
            "chapter": "Logical Reasoning",
            "topic": "Series",
            "question_text": "Find the next number in the series: 2, 6, 12, 20, 30, ?",
            "options": [
                {"text": "40", "is_correct": False},
                {"text": "42", "is_correct": True},
                {"text": "44", "is_correct": False},
                {"text": "46", "is_correct": False}
            ],
            "explanation": "Pattern is n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.",
            "difficulty": "easy"
        },
        {
            "chapter": "Quantitative Aptitude",
            "topic": "Percentages",
            "question_text": "If A's salary is 20% less than B's salary, by what percent is B's salary more than A's?",
            "options": [
                {"text": "20%", "is_correct": False},
                {"text": "25%", "is_correct": True},
                {"text": "22%", "is_correct": False},
                {"text": "30%", "is_correct": False}
            ],
            "explanation": "If B=100, A=80. Difference=20. Percentage = (20/80)×100 = 25%.",
            "difficulty": "medium"
        }
    ]
}


def create_sample_questions(subject: str = "Physics") -> List[Question]:
    """Create sample questions for the given subject from static data."""
    questions = []
    
    sample_data = SAMPLE_QUESTIONS.get(subject, [])
    
    if not sample_data:
        # Fallback to Physics if subject not found
        sample_data = SAMPLE_QUESTIONS.get("Physics", [])
    
    for q_data in sample_data:
        options = []
        correct_option_id = None
        
        for i, opt in enumerate(q_data["options"]):
            opt_id = str(uuid.uuid4())
            options.append(QuestionOption(
                id=opt_id,
                text=opt["text"],
                is_correct=opt.get("is_correct", False)
            ))
            if opt.get("is_correct", False):
                correct_option_id = opt_id
        
        difficulty_map = {
            "easy": DifficultyLevel.EASY,
            "medium": DifficultyLevel.MEDIUM,
            "hard": DifficultyLevel.HARD
        }
        
        question = Question(
            subject=subject,
            chapter=q_data["chapter"],
            topic=q_data["topic"],
            question_text=q_data["question_text"],
            options=options,
            correct_option_id=correct_option_id,
            explanation=q_data["explanation"],
            difficulty=difficulty_map.get(q_data["difficulty"], DifficultyLevel.MEDIUM)
        )
        questions.append(question)
    
    return questions


async def generate_ai_questions_for_mock(subject: str, count: int = 10) -> List[Question]:
    """Generate questions using AI for a mock test."""
    generator = QuestionGenerator()
    
    syllabus = SUBJECT_SYLLABUS.get(subject, {})
    if not syllabus:
        return []
    
    chapters = list(syllabus.keys())
    questions_per_chapter = max(1, count // len(chapters))
    
    all_questions = []
    
    for chapter in chapters[:5]:  # Limit to 5 chapters to avoid too many API calls
        topics = syllabus[chapter]
        
        # Mix of difficulties
        for difficulty in [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD]:
            questions = await generator.generate_questions(
                subject=subject,
                chapter=chapter,
                topics=topics[:3],
                count=max(1, questions_per_chapter // 3),
                difficulty=difficulty
            )
            all_questions.extend(questions)
            
            if len(all_questions) >= count:
                break
        
        if len(all_questions) >= count:
            break
    
    random.shuffle(all_questions)
    return all_questions[:count]
