var startingHorseCount = 20,
    scoreRange = 10,
    maxPoints = 45;

(function app () {
    var OFFSET = 1,
        horserace = document.getElementById('horserace');

    function getPosition(waveNum, score) {
        var raceHeight = horserace.clientHeight,
            raceWidth = horserace.clientWidth,
            marginWidth = getHorseWidth(),
            scoreZone = raceWidth - marginWidth - 20,
            waveHeight = Math.floor(raceHeight/(getWaveCount()+OFFSET));
        return {
            left: Math.floor(marginWidth + (score/scoreRange) * scoreZone),
            top: waveHeight*(waveNum+1)
        }
    }

    function updateTooltip (horse, horseInfo) {
        var tooltip = horse.parentNode.getElementsByClassName('tooltip')[0];
        tooltip.innerHTML = "Name: " + horseInfo.name + "<br>Score: " + horseInfo.score;
    }

    function calculatePositions() {
        var i, j, wave, waves, children, pos, stick, horse, tooltip, marks, markpos,
            horseWidth = getHorseWidth();
        waves = document.getElementsByClassName('wave');
        for (i = 0; i < waves.length; i++) {
            pos = getPosition(i, 0);
            wave = waves[i];
            children = Array.prototype.slice.call(wave.children);
            wave.style.top = pos.top;
            wave.style.backgroundPosition = 0-20*i;
            stick = children.find(function(el) {return el.className === 'stick'});
            stick.style.left = stick.style.left || Math.floor(horseWidth/2);
            horse = children.find(function(el) {return el.className === 'horse'});
            horse.style.width = horse.style.height = horseWidth;
            horse.style.left = horse.style.left || 0;
            tooltip = children.find(function(el) {return el.className === 'tooltip'});

            marks = children.filter(function(el){return el.className === 'scoremark'});
            for (j = 0; j < marks.length; j++) {
                markpos = getPosition(i, parseInt(marks[j].textContent, 10));
                marks[j].style.top = Math.floor(horseWidth/2);
                marks[j].style.left = markpos.left;
            }
        }
    }
    function addWave (horseInfo) {
        var wave, scoremark, mark, stick, horse, tooltip;

        wave = document.createElement('div');
        wave.className = 'wave';
        wave.id = 'wave_' + horseInfo.key;
        wave.style.width = '400%';
        wave.style.height = '300px';
        wave.style.position = "absolute";
        wave.style.left = 0;
        wave.style.backgroundImage = 'url("sine.png")';
        wave.style.backgroundSize = '100px 300px';
        wave.style.backgroundRepeat = 'repeat-x';
        wave.ontouchstart = function() {this.className = 'wave touching'};
        wave.ontouchend = function() {this.className = 'wave'};

        for (scoremark = 0; scoremark <= maxPoints; scoremark += 3) {
            mark = document.createElement('span');
            mark.className = 'scoremark';
            mark.style.position = "absolute";
            mark.innerHTML = scoremark;
            wave.appendChild(mark);
        }

        stick = document.createElement('img');
        stick.className = 'stick';
        stick.style.position = 'absolute';
        stick.style.top = '20px';
        stick.style.width = 3;
        stick.src = "stick.png";
        wave.appendChild(stick);

        horse = document.createElement('img');
        horse.className = 'horse';
        horse.style.position = 'absolute';
        horse.style.top = '0px';
        horse.src = "placeholder.png";
        horse.onclick = function() {
            var waves;
            if (this.parentNode.classList.contains('clicked'))
                return this.parentNode.classList.remove('clicked');
            waves = Array.prototype.slice.call(document.getElementsByClassName('wave'));
            waves.forEach(function(el){el.classList.remove('clicked');});
            this.parentNode.classList.add('clicked');
        }
        wave.appendChild(horse);

        tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.top = '0px';
        tooltip.style.left = 100;
        tooltip.style.zIndex = 1;
        wave.appendChild(tooltip);

        horserace.appendChild(wave);
        updateTooltip(horse, horseInfo);
    }
    function removeWave (key) {
        var wave = document.getElementById('wave_' + key);
        wave.parentNode.removeChild(wave);
        calculatePositions();
    }

    function getWaveCount() {
        return document.getElementsByClassName('wave').length;
    }
    function getHorseWidth() {
        return 1.2*Math.floor(window.innerHeight/(getWaveCount()+OFFSET));
    }

    function updateHorseScore (horse, horseInfo) {
        var pos = getPosition(0, horseInfo.score),
            stick = horse.parentNode.getElementsByClassName('stick')[0],
            tooltip = horse.parentNode.getElementsByClassName('tooltip')[0],
            horseWidth = getHorseWidth();
        stick.style.left = pos.left;
        horse.style.left = pos.left-Math.floor(horseWidth/2);
        tooltip.style.left = pos.left + (horseInfo.score<maxPoints/2 ? +horseWidth/2+30 : -horseWidth/2-180);
        updateTooltip(horse, horseInfo);
    }

    function processScores(scorelist) {
        var maxScore = 0,
            waves = document.getElementsByClassName('wave');
        Array.prototype.forEach.call(waves, function (w) {
            var key = w.id.replace('wave_', '');
            if (scorelist.findIndex(function(h) { return h.key === key; }) === -1) {
                removeWave(key);
            }
        });
        scorelist.forEach(function (el, i) {
            if (!document.getElementById('wave_' + el.key)) {
                addWave(el);
            }
        });
        scorelist.forEach(function (el, i) {
            var wave = document.getElementById('wave_' + el.key);
            updateHorseScore(wave.getElementsByClassName('horse')[0], el);
        });
        scorelist.forEach(function (el) {
            maxScore = el.score > maxScore ? el.score : maxScore;
        });
        scoreRange = Math.min(maxScore-(maxScore%18)+18, maxPoints);
        calculatePositions();
    }

    (function simulateRace () {
        var names = {}, name, i, horseInfo = [];

        function randomAlpha () {
            var ALPHAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return ALPHAS.charAt(Math.floor(Math.random() * ALPHAS.length));
        }
        function generateName () {
            var name;
            while (true) {
                name = randomAlpha() + randomAlpha();
                if (names[name] === undefined) {
                    names[name] = 0;
                    return name;
                }
            }
        }
        function getMinScore () {
            var minScore;
            horseInfo.forEach(function(h) {
                if (minScore === undefined || h.score < minScore)
                    minScore = h.score;
            });
            return minScore;
        }

        for (i = 0; i < startingHorseCount; i++) {
            name = generateName();
            horseInfo.push({name: name, key: name, score: 0});
        }
        processScores(horseInfo);

        var myTimer,
            speed = window.location.search.match(/[?&]fast/) ? 300 : 3000;

        myTimer = window.setInterval(function simulateUpdates() {
            var i, points, name;
            // simulate drop-outs (x% chance each iteration)
            for (i = 0; i < horseInfo.length; i++) {
                if (Math.random() < 0.01) {
                    horseInfo.splice(i--, 1);
                    // 30% of the time replace with a new horse
                    if (Math.random() < 0.3) {
                        name = generateName();
                        horseInfo.push({name: name, key: name, score: getMinScore()});
                    }
                }
            }
            // increase scores
            for (i = 0; i < horseInfo.length; i++) {
                if (Math.random() < 0.6) {
                    continue;
                }
                points = Math.floor(-1 + Math.random()*4);
                points = points < 0 ? 0 : points;
                horseInfo[i].score += points;
                if (horseInfo[i].score >= maxPoints) {
                    horseInfo[i].score = maxPoints;
                    window.clearInterval(myTimer);
                }
            }
            if (horseInfo.length <= 2)
                window.clearInterval(myTimer);
            processScores(horseInfo);
        }, speed);
    })();
}());
