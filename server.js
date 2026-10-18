<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Philippine Laws Group Quiz</title>
    <script src="/socket.io/socket.io.js"></script>
    <style>
        :root {
            --primary: #4f46e5;
            --success: #16a34a;
            --danger: #dc2626;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), 
                        url('background.jpg') no-repeat center center fixed;
            background-size: cover;
            color: #1e293b;
            margin: 0;
            padding: 10px;
            min-height: 100vh;
            box-sizing: border-box;
        }
        .container { 
            max-width: 900px; 
            margin: 0 auto; 
            background: rgba(255, 255, 255, 0.95); 
            padding: 20px; 
            border-radius: 12px; 
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); 
        }
        h1 { font-size: 24px; }
        h2 { font-size: 20px; }
        h1, h2 { text-align: center; color: #0f172a; }
        .hidden { display: none !important; }
        
        /* Role Selection */
        #role-select { text-align: center; padding: 20px 0; }
        .btn { 
            background: var(--primary); 
            color: white; 
            border: none; 
            padding: 12px 20px; 
            font-size: 16px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-weight: bold; 
            margin: 6px; 
            transition: background 0.2s; 
        }
        .btn:hover { background: #4338ca; }
        .group-btn { background: #0284c7; }
        .group-btn:hover { background: #0369a1; }

        /* Timer Header */
        .header-bar { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            background: #e2e8f0; 
            padding: 12px 15px; 
            border-radius: 8px; 
            margin-bottom: 20px; 
            font-weight: bold; 
            font-size: 18px; 
        }
        
        /* Teacher Big Screen Bar Chart */
        .bar-chart-container { margin: 20px 0; background: #f1f5f9; padding: 15px; border-radius: 8px; }
        .bar-row { display: flex; align-items: center; margin: 12px 0; }
        .bar-label { width: 90px; font-weight: bold; font-size: 14px; }
        .bar-track { flex-grow: 1; background: #cbd5e1; height: 26px; border-radius: 6px; overflow: hidden; margin: 0 10px; position: relative; }
        .bar-fill { height: 100%; background: var(--primary); width: 0%; transition: width 0.4s ease-in-out; border-radius: 6px; }
        .bar-score { font-weight: bold; width: 40px; text-align: right; font-size: 14px; }

        /* Quiz Questions & Explanations */
        .question-card { background: #fff; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .options label { 
            display: flex; 
            align-items: center; 
            padding: 12px; 
            margin: 8px 0; 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 15px; 
            transition: background 0.2s; 
        }
        .options label input { margin-right: 10px; transform: scale(1.2); }
        .options label:hover { background: #e2e8f0; }
        .explanation { margin-top: 10px; padding: 12px; background: #eff6ff; border-left: 4px solid var(--primary); font-size: 13px; color: #1e3a8a; border-radius: 0 6px 6px 0; }

        /* Popup Feedback (Check / X) */
        #feedback-popup { position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 8px; font-size: 18px; font-weight: bold; color: white; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: none; }
        .feedback-correct { background-color: var(--success); }
        .feedback-wrong { background-color: var(--danger); }

        /* Responsive Design para sa Cellphone */
        @media (max-width: 600px) {
            body { padding: 5px; }
            .container { padding: 12px; border-radius: 8px; }
            h1 { font-size: 20px; }
            h2 { font-size: 16px; }
            .header-bar { font-size: 14px; padding: 10px; flex-direction: column; gap: 8px; text-align: center; }
            .btn { width: 100%; margin: 4px 0; padding: 10px; font-size: 15px; }
            .bar-label { width: 70px; font-size: 12px; }
            .bar-score { font-size: 12px; }
            .options label { font-size: 14px; padding: 10px; }
        }
    </style>
</head>
<body>

    <div id="feedback-popup"></div>

    <div class="container">
        <!-- ROLE SELECTION VIEW -->
        <div id="role-select">
            <h1>Philippine Laws Group Quiz</h1>
            <p>Select your mode to begin:</p>
            <br>
            <button class="btn" onclick="selectRole('teacher')">📺 Teacher Big Screen Monitor</button>
            <br><br>
            <h3>Join as Group:</h3>
            <button class="btn group-btn" onclick="selectGroup('Group 1')">Group 1</button>
            <button class="btn group-btn" onclick="selectGroup('Group 2')">Group 2</button>
            <button class="btn group-btn" onclick="selectGroup('Group 3')">Group 3</button>
            <button class="btn group-btn" onclick="selectGroup('Group 4')">Group 4</button>
        </div>

        <!-- TEACHER BIG SCREEN VIEW -->
        <div id="teacher-view" class="hidden">
            <h1>Teacher Real-Time Monitor</h1>
            <div class="header-bar">
                <span id="teacher-timer">Time Left: 01:30</span>
                <div>
                    <button class="btn" onclick="startTimer()">Start Quiz</button>
                    <button class="btn" style="background:var(--danger)" onclick="resetGame()">Reset Game</button>
                </div>
            </div>

            <h3>Live Scoreboard (Highest to Lowest)</h3>
            <div class="bar-chart-container" id="bar-chart">
                <!-- Dynamic Bars generated via JS -->
            </div>
            
            <hr style="margin: 30px 0; border:0; border-top:1px solid #cbd5e1;">
            <h2>Answer Key & Independent Explanations</h2>
            <div id="teacher-answer-key">
                <div class="question-card">
                    <p><b>Q1:</b> Magna Carta for Disabled Persons</p>
                    <div class="explanation"><b>Explanation:</b> Republic Act No. 7277 provides the rehabilitation, self-development, and integration of disabled persons into society.</div>
                </div>
                <div class="question-card">
                    <p><b>Q2:</b> Protection Against Child Abuse</p>
                    <div class="explanation"><b>Explanation:</b> Republic Act No. 7610 institutes policies to protect children from all forms of abuse, neglect, and exploitation.</div>
                </div>
                <div class="question-card">
                    <p><b>Q3:</b> Indigenous Peoples' Rights Act (IPRA)</p>
                    <div class="explanation"><b>Explanation:</b> Republic Act No. 8371 recognizes, protects, and promotes the rights of indigenous cultural communities and indigenous peoples.</div>
                </div>
                <div class="question-card">
                    <p><b>Q4:</b> Fundamental Supreme Law</p>
                    <div class="explanation"><b>Explanation:</b> The 1987 Philippine Constitution is the fundamental framework from which all other statutes and rights derive.</div>
                </div>
                <div class="question-card">
                    <p><b>Q5:</b> Equal Opportunity for Employment and Training</p>
                    <div class="explanation"><b>Explanation:</b> Republic Act No. 7277 strictly outlines provisions protecting disabled persons from employment discrimination.</div>
                </div>
                <div class="question-card">
                    <p><b>Q6:</b> Penalizes Child Trafficking</p>
                    <div class="explanation"><b>Explanation:</b> Republic Act No. 7610 specifies severe penalties for child trafficking, child prostitution, and other abuses against minors.</div>
                </div>
            </div>
        </div>

        <!-- STUDENT GROUP VIEW -->
        <div id="student-view" class="hidden">
            <h1 id="group-title">Group Dashboard</h1>
            <div class="header-bar">
                <span id="student-timer">Time Left: 01:30</span>
                <span id="group-score-display">Score: 0 / 6</span>
            </div>

            <div id="quiz-questions">
                <!-- Q1 -->
                <div class="question-card" id="card-q1">
                    <p><b>Q1:</b> Which law is known as the Magna Carta for Disabled Persons?</p>
                    <div class="options">
                        <label><input type="radio" name="q1" value="RA7277" onchange="submitAns('q1', 'RA7277')"> Republic Act No. 7277</label>
                        <label><input type="radio" name="q1" value="RA7610" onchange="submitAns('q1', 'RA7610')"> Republic Act No. 7610</label>
                        <label><input type="radio" name="q1" value="RA8371" onchange="submitAns('q1', 'RA8371')"> Republic Act No. 8371</label>
                    </div>
                </div>

                <!-- Q2 -->
                <div class="question-card" id="card-q2">
                    <p><b>Q2:</b> What law provides stronger deterrence and special protection against child abuse, exploitation and discrimination?</p>
                    <div class="options">
                        <label><input type="radio" name="q2" value="RA7277" onchange="submitAns('q2', 'RA7277')"> Republic Act No. 7277</label>
                        <label><input type="radio" name="q2" value="RA7610" onchange="submitAns('q2', 'RA7610')"> Republic Act No. 7610</label>
                        <label><input type="radio" name="q2" value="RA8371" onchange="submitAns('q2', 'RA8371')"> Republic Act No. 8371</label>
                    </div>
                </div>

                <!-- Q3 -->
                <div class="question-card" id="card-q3">
                    <p><b>Q3:</b> Which law is recognized as the Indigenous Peoples' Rights Act (IPRA)?</p>
                    <div class="options">
                        <label><input type="radio" name="q3" value="RA7610" onchange="submitAns('q3', 'RA7610')"> Republic Act No. 7610</label>
                        <label><input type="radio" name="q3" value="RA8371" onchange="submitAns('q3', 'RA8371')"> Republic Act No. 8371</label>
                        <label><input type="radio" name="q3" value="CONST" onchange="submitAns('q3', 'CONST')"> 1987 Constitution</label>
                    </div>
                </div>

                <!-- Q4 -->
                <div class="question-card" id="card-q4">
                    <p><b>Q4:</b> What supreme law of the Philippines serves as the fundamental framework for all civil rights and state policies?</p>
                    <div class="options">
                        <label><input type="radio" name="q4" value="RA7277" onchange="submitAns('q4', 'RA7277')"> Republic Act No. 7277</label>
                        <label><input type="radio" name="q4" value="CONST" onchange="submitAns('q4', 'CONST')"> The 1987 Philippine Constitution</label>
                        <label><input type="radio" name="q4" value="RA8371" onchange="submitAns('q4', 'RA8371')"> Republic Act No. 8371</label>
                    </div>
                </div>

                <!-- Q5 -->
                <div class="question-card" id="card-q5">
                    <p><b>Q5:</b> Which statutory framework specifically mandates equal opportunity for employment and training for persons with disabilities?</p>
                    <div class="options">
                        <label><input type="radio" name="q5" value="RA7277" onchange="submitAns('q5', 'RA7277')"> Republic Act No. 7277</label>
                        <label><input type="radio" name="q5" value="RA7610" onchange="submitAns('q5', 'RA7610')"> Republic Act No. 7610</label>
                        <label><input type="radio" name="q5" value="CONST" onchange="submitAns('q5', 'CONST')"> 1987 Constitution</label>
                    </div>
                </div>

                <!-- Q6 -->
                <div class="question-card" id="card-q6">
                    <p><b>Q6:</b> Which specific legislation penalizes child trafficking and protects children in especially difficult circumstances?</p>
                    <div class="options">
                        <label><input type="radio" name="q6" value="RA8371" onchange="submitAns('q6', 'RA8371')"> Republic Act No. 8371</label>
                        <label><input type="radio" name="q6" value="RA7610" onchange="submitAns('q6', 'RA7610')"> Republic Act No. 7610</label>
                        <label><input type="radio" name="q6" value="RA7277" onchange="submitAns('q6', 'RA7277')"> Republic Act No. 7277</label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const socket = io();
        let myGroup = null;
        let answeredQuestions = {};

        function selectRole(role) {
            if (role === 'teacher') {
                document.getElementById('role-select').classList.add('hidden');
                document.getElementById('teacher-view').classList.remove('hidden');
            }
        }

        function selectGroup(groupName) {
            myGroup = groupName;
            document.getElementById('role-select').classList.add('hidden');
            document.getElementById('student-view').classList.remove('hidden');
            document.getElementById('group-title').innerText = `Dashboard: ${groupName}`;
        }

        function startTimer() {
            socket.emit('startTimer');
        }

        function resetGame() {
            socket.emit('resetGame');
        }

        function submitAns(questionId, answer) {
            if (!myGroup) return;
            if (answeredQuestions[questionId]) return;

            answeredQuestions[questionId] = true;
            const card = document.getElementById(`card-${questionId}`);
            if (card) {
                card.querySelectorAll('input').forEach(input => {
                    input.disabled = true;
                });
                card.style.opacity = "0.75";
            }

            socket.emit('submitAnswer', { groupName: myGroup, questionId, answer });
        }

        socket.on('answerFeedback', ({ questionId, isCorrect }) => {
            const popup = document.getElementById('feedback-popup');
            if (isCorrect) {
                popup.className = "feedback-correct";
                popup.innerHTML = "✔ Correct!";
            } else {
                popup.className = "feedback-wrong";
                popup.innerHTML = "✖ Incorrect!";
            }
            popup.style.display = "block";
            setTimeout(() => {
                popup.style.display = "none";
            }, 1800);
        });

        socket.on('updateState', ({ groupScores, timer, timerRunning }) => {
            let mins = Math.floor(timer / 60).toString().padStart(2, '0');
            let secs = (timer % 60).toString().padStart(2, '0');
            let timeStr = `Time Left: ${mins}:${secs}`;
            document.getElementById('teacher-timer').innerText = timeStr;
            document.getElementById('student-timer').innerText = timeStr;

            const sortedGroups = Object.entries(groupScores).sort((a, b) => b[1] - a[1]);
            let chartHTML = '';
            sortedGroups.forEach(([group, score]) => {
                let percentage = (score / 6) * 100;
                chartHTML += `
                    <div class="bar-row">
                        <div class="bar-label">${group}</div>
                        <div class="bar-track">
                            <div class="bar-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="bar-score">${score}/6</div>
                    </div>
                `;
            });
            document.getElementById('bar-chart').innerHTML = chartHTML;

            if (myGroup && groupScores[myGroup] !== undefined) {
                document.getElementById('group-score-display').innerText = `Score: ${groupScores[myGroup]} / 6`;
            }

            if (timer <= 0) {
                document.querySelectorAll('input').forEach(input => input.disabled = true);
            }
        });

        socket.on('timerUpdate', (timer) => {
            let mins = Math.floor(timer / 60).toString().padStart(2, '0');
            let secs = (timer % 60).toString().padStart(2, '0');
            let timeStr = `Time Left: ${mins}:${secs}`;
            document.getElementById('teacher-timer').innerText = timeStr;
            document.getElementById('student-timer').innerText = timeStr;
        });

        socket.on('timeUp', () => {
            alert("Time is up! The quiz session has concluded.");
            document.querySelectorAll('input').forEach(input => input.disabled = true);
        });

        socket.on('resetState', () => {
            location.reload();
        });
    </script>
</body>
</html>