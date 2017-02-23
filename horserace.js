var horseCount = 10,
    maxPoints = 48;

(function app () {
    var HORSE_LEFT_OFFSET = 80,
        OFFSET = 1,
        field = document.getElementById('field'),
        waveHeight = Math.floor(window.innerHeight/(horseCount+OFFSET)),
        horseInfo = [{}];

    (function populateHorseInfo() {
        var i;
        for (i = 1; i <= horseCount; i++) {
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

    function getPosition(horse, score) {
        var marginWidth = Math.floor(window.innerWidth/15),
            scoreZone = window.innerWidth - 2*marginWidth;
        return {
            left: Math.floor(marginWidth + (score/maxPoints) * scoreZone),
            top: OFFSET+waveHeight*horse
        }
    }

    function updateTooltip (horse) {
        var tooltip = document.getElementById('tooltip_' + horse);
        tooltip.innerHTML = "Name: " + horseInfo[horse].name + "<br>Score: " + horseInfo[horse].score;
    }

    function calculatePositions() {
    }
    function addWave (horseNum) {
        var wave, scoremark, pos;
        pos = getPosition(horseNum, 0);

        wave = document.createElement('div');
        wave.className = 'wave';
        wave.id = 'wave_'+horseNum;
        wave.style.width = '400%';
        wave.style.height = '160px';
        wave.style.position = "fixed";
        wave.style.left = 0 - 20*horseNum;
        wave.style.top = pos.top;
        wave.style.backgroundImage = 'url("sine.png")';
        wave.style.backgroundSize = '100px 160px';
        wave.style.backgroundRepeat = 'repeat-x';
        wave.ontouchstart = function() {this.className = 'wave touching'};
        wave.ontouchend = function() {this.className = 'wave'};

        for (scoremark = 0; scoremark <= maxPoints; scoremark += 5) {
            markpos = getPosition(horseNum, scoremark);
            mark = document.createElement('span');
            mark.className = 'scoremark';
            mark.style.position = "fixed";
            mark.style.left = markpos.left;
            mark.style.top = markpos.top + 50;
            mark.innerHTML = scoremark;
            wave.appendChild(mark);
        }

        horse = document.createElement('img');
        horse.id = 'horse_'+horseNum;
        horse.className = 'horse';
        horse.style.position = 'fixed';
        horse.style.left = pos.left-HORSE_LEFT_OFFSET;
        horse.style.top = pos.top-20;
        horse.src = "placeholder.png";
        scale = window.innerHeight/160/5;
        horse.height = Math.floor(160*scale);
        horse.width = Math.floor(140*scale);
        wave.appendChild(horse);

        tooltip = document.createElement('span');
        tooltip.id = 'tooltip_' + horseNum;
        tooltip.className = 'tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.top = parseInt(wave.style.top, 10) + waveHeight - 80;
        tooltip.style.left = 100;
        tooltip.style.zIndex = 1;
        wave.appendChild(tooltip);

        field.appendChild(wave);
        updateTooltip(horseNum);
        calculatePositions();
    }
    function removeWave (horseNum) {
        var wave = document.getElementById('wave_' + horseNum);
        wave.parentNode.remove(wave);
        calculatePositions();
    }
    (function makeWaves () {
        var i;
        for (i = 1; i <= horseCount; i++) {
            addWave(i);
        }
    }());

    function updateHorseScore (horseNum, score) {
        var horse = document.getElementById('horse_'+horseNum),
            pos = getPosition(horse, score),
            tooltip = document.getElementById('tooltip_'+horseNum);
        horse.style.left = pos.left-HORSE_LEFT_OFFSET;
        tooltip.style.left = pos.left + (score<maxPoints/2 ? +100 : -200);
        updateTooltip(horseNum);
    };

    (function simulateRace () {
        var myTimer,
            speed = window.location.search.match(/[?&]fast/) ? 300 : 3000;

        myTimer = window.setInterval(function updateScores() {
            var i, horse, points;
            for (i = 1; i <= horseCount; i++) {
                if (Math.random() < 0.2+i*0.01) {
                    // lower horses have more chance to get 0 points
                    continue;
                }
                points = Math.floor(-1 + Math.random()*4);
                points = points < 0 ? 0 : points;
                horseInfo[i].score += points;
                if (horseInfo[i].score >= maxPoints) {
                    horseInfo[i].score = maxPoints;
                    window.clearInterval(myTimer);
                }
                updateHorseScore(i, horseInfo[i].score);
            }
        }, speed);
    })();
}());
