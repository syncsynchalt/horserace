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

    function getZIndex(horse) {
        return 100*(OFFSET+horse);
    }

    function updateTooltip (horse) {
        var tooltip = document.getElementById('tooltip_' + horse);
        tooltip.innerHTML = "Name: " + horseInfo[horse].name + "<br>Score: " + horseInfo[horse].score;
    }

    (function makeWaves () {
        var wave, horse, i, pos, tooltip;

        var waveTouchStart = function() {
            this.className = 'wave touching';
        }
        var waveTouchEnd = function() {
            this.className = 'wave';
        }
        for (i = 1; i <= horseCount; i++) {
            pos = getPosition(i, 0);

            wave = document.createElement('div');
            wave.className = 'wave';
            wave.id = 'wave_'+i;
            wave.style.width = '400%';
            wave.style.height = '160px';
            wave.style.position = "fixed";
            wave.style.left = 0 - 20*i;
            wave.style.top = pos.top;
            wave.style.backgroundImage = 'url("sine.png")';
            wave.style.backgroundSize = '100px 160px';
            wave.style.backgroundRepeat = 'repeat-x';
            wave.ontouchstart = waveTouchStart;
            wave.ontouchend = waveTouchEnd;

            horse = document.createElement('img');
            horse.id = 'horse_'+i;
            horse.className = 'horse';
            horse.style.position = 'fixed';
            horse.style.left = pos.left-HORSE_LEFT_OFFSET;
            horse.style.top = pos.top-20;
            horse.src = "horsey.png";
            scale = window.innerHeight/160/5;
            horse.height = Math.floor(160*scale);
            horse.width = Math.floor(140*scale);
            wave.appendChild(horse);

            tooltip = document.createElement('span');
            tooltip.id = 'tooltip_' + i;
            tooltip.className = 'tooltip';
            tooltip.style.position = 'fixed';
            tooltip.style.top = parseInt(wave.style.top, 10) + waveHeight - 80;
            tooltip.style.left = 100;
            tooltip.style.zIndex = 1;
            wave.appendChild(tooltip);

            field.appendChild(wave);
            updateTooltip(i);
        }
    }());

    (function markScores () {
        var i, j, mark;

        var mark = function (horse, score) {
            var pos = getPosition(horse, score),
                mark = document.createElement('span'),
                wave = document.getElementById('wave_'+horse);

            mark.className = 'scoremark';
            mark.style.position = "fixed";
            mark.style.left = pos.left;
            mark.style.top = pos.top + 50;
            mark.innerHTML = score;
            wave.appendChild(mark);
        }

        for (i = 1; i <= horseCount; i += 3) {
            for (j = 0; j <= maxPoints; j += 6) {
                mark(i, j);
            }
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
