var horseCount = 10,
    maxPoints = 45;

(function app () {
    var HORSE_LEFT_OFFSET = 80,
        OFFSET = 1,
        field = document.getElementById('field'),
        horseInfo = [];

    (function populateHorseInfo() {
        var i;
        for (i = 0; i < horseCount; i++) {
            function randomAlpha() {
                var ALPHAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                return ALPHAS.charAt(Math.floor(Math.random() * ALPHAS.length));
            }
            horseInfo.push({
                name: randomAlpha() + randomAlpha(),
                score: 0
            });
        }
    }());

    function getPosition(waveNum, score) {
        var marginWidth = getHorseWidth(),
            scoreZone = window.innerWidth - marginWidth - 20,
            waveHeight = Math.floor(window.innerHeight/(horseCount+OFFSET));
        return {
            left: Math.floor(marginWidth + (score/maxPoints) * scoreZone),
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
            stick = children.find(function(el) {return el.className === 'stick'});
            stick.style.top = pos.top-20 + Math.floor(horseWidth/2);
            horse = children.find(function(el) {return el.className === 'horse'});
            horse.style.width = horse.style.height = horseWidth;
            horse.style.top = pos.top-20;
            tooltip = children.find(function(el) {return el.className === 'tooltip'});
            tooltip.style.top = pos.top;

            marks = children.filter(function(el){return el.className === 'scoremark'});
            for (j = 0; j < marks.length; j++) {
                markpos = getPosition(i, parseInt(marks[j].textContent, 10));
                marks[j].style.top = markpos.top+50;
                marks[j].style.left = markpos.left;
            }
        }
    }
    function addWave (horseNum, horseInfo) {
        var wave, scoremark, pos, mark,
            horseWidth = getHorseWidth();
        pos = getPosition(0, 0);

        wave = document.createElement('div');
        wave.className = 'wave';
        wave.style.width = '400%';
        wave.style.height = '160px';
        wave.style.position = "fixed";
        wave.style.left = 0;
        wave.style.backgroundImage = 'url("sine.png")';
        wave.style.backgroundSize = '100px 160px';
        wave.style.backgroundRepeat = 'repeat-x';
        wave.style.backgroundPosition = 0-20*horseNum;
        wave.onclick = function() {
            var waves;
            if (this.classList.contains('clicked'))
                return this.classList.remove('clicked');
            waves = Array.prototype.slice.call(document.getElementsByClassName('wave'));
            waves.forEach(function(el){el.classList.remove('clicked');});
            this.classList.add('clicked');
        }
        wave.ontouchstart = function() {this.className = 'wave touching'};
        wave.ontouchend = function() {this.className = 'wave'};

        for (scoremark = 0; scoremark <= maxPoints; scoremark += 5) {
            mark = document.createElement('span');
            mark.className = 'scoremark';
            mark.style.position = "fixed";
            mark.innerHTML = scoremark;
            wave.appendChild(mark);
        }

        stick = document.createElement('img');
        stick.className = 'stick';
        stick.style.position = 'fixed';
        stick.style.width = 4;
        stick.style.left = pos.left - Math.floor(horseWidth/2);
        stick.src = "stick.png";
        wave.appendChild(stick);

        horse = document.createElement('img');
        horse.className = 'horse';
        horse.style.position = 'fixed';
        horse.style.left = pos.left - horseWidth;
        horse.src = "placeholder.png";
        wave.appendChild(horse);

        tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.left = 100;
        tooltip.style.zIndex = 1;
        wave.appendChild(tooltip);

        field.appendChild(wave);
        updateTooltip(horse, horseInfo);
    }
    function removeWave (wave) {
        wave.parentNode.remove(wave);
        calculatePositions();
    }
    (function makeWaves () {
        var i;
        for (i = 0; i < horseCount; i++) {
            addWave(i, horseInfo[i]);
        }
        calculatePositions();
    }());

    function getHorseWidth() {
        return 1.2*Math.floor(window.innerHeight/(horseCount+OFFSET));
    };

    function updateHorseScore (horse, horseInfo) {
        var pos = getPosition(horse, horseInfo.score),
            stick = horse.parentNode.getElementsByClassName('stick')[0],
            tooltip = horse.parentNode.getElementsByClassName('tooltip')[0],
            horseWidth = getHorseWidth();
        stick.style.left = pos.left-Math.floor(horseWidth/2);
        horse.style.left = pos.left-horseWidth;
        tooltip.style.left = pos.left + (horseInfo.score<maxPoints/2 ? +100 : -200);
        updateTooltip(horse, horseInfo);
    };

    (function simulateRace () {
        var myTimer,
            speed = window.location.search.match(/[?&]fast/) ? 300 : 3000;

        myTimer = window.setInterval(function updateScores() {
            var i, horse, points, horses;
            horses = document.getElementsByClassName('horse');
            for (i = 0; i < horses.length; i++) {
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
                updateHorseScore(horses[i], horseInfo[i]);
            }
        }, speed);
    })();
}());
