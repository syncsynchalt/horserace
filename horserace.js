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

    (function makeWaves () {
        var div, i, pos;

        for (i = 1; i <= horseCount; i++) {
            div = document.createElement('div');
            div.className = 'wave';
            div.id = 'wave_'+i;
            div.style.zIndex = getZIndex(i);
            div.style.width = '400%';
            div.style.height = '160px';
            div.style.position = "fixed";
            div.style.left = 0 - 20*i;
            div.style.top = getPosition(i, 0).top;
            div.style.backgroundImage = 'url("sine.png")';
            div.style.backgroundSize = '100px 160px';
            div.style.backgroundRepeat = 'repeat-x';
            field.appendChild(div);
        }
    }());

    (function markScores () {
        var i, j, mark;

        var mark = function (horse, score) {
            var pos = getPosition(horse, score),
                span = document.createElement('span'),
                wave = document.getElementById('wave_'+horse);

            span.className = 'score';
            span.style.zIndex = getZIndex(i)+1;
            span.style.position = "fixed";
            span.style.left = pos.left;
            span.style.top = pos.top + 50;
            span.innerHTML = score;
            wave.appendChild(span);
        }

        for (i = 1; i <= horseCount; i += 3) {
            for (j = 0; j <= maxPoints; j += 6) {
                mark(i, j);
            }
        }
    }());

    function clearTooltips () {
        var elements = document.getElementsByClassName('tooltip'), i;
        for (i = 0; i < elements.length; i++) {
            elements[i].parentNode.removeChild(elements[i]);
        }
    }
    function onHorseEnter () {
        var horse = this,
            num = horse.id.replace(/.*_/, ''),
            horseLeft = parseInt(horse.style.left, 10),
            tooltip = document.createElement('span'),
            offset = Math.floor(150*window.innerWidth/140/8);
        clearTooltips();
        tooltip.id = 'tooltip_' + num;
        tooltip.className = 'tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.top = parseInt(horse.style.top, 10) + waveHeight - 50;
        if (horseLeft > window.innerWidth/2) {
            tooltip.style.left = horseLeft-offset;
        } else {
            tooltip.style.left = horseLeft+offset;
        }
        tooltip.style.opacity = 0;
        tooltip.style.zIndex = parseInt(horse.style.zIndex, 10)+1;
        tooltip.innerHTML = "Name: " + horseInfo[num].name + "<br>Score: " + horseInfo[num].score;
        horse.parentNode.appendChild(tooltip);
        window.setTimeout(function() { tooltip.style.opacity = 1 }, 1);
    }
    function onHorseLeave () {
        var horse = this,
            num = horse.id.replace(/.*_/, ''),
            tooltip = document.getElementById('tooltip_' + num);
        tooltip.parentNode.removeChild(tooltip);
    }
    (function addHorses () {
        var i, img, pos, wave, scale;
        for (i = 1; i <= horseCount; i++) {
            wave = document.getElementById('wave_'+i);
            pos = getPosition(i, 0);
            img = document.createElement('img');
            img.id = 'horse_'+i;
            img.className = 'horse';
            img.style.zIndex = getZIndex(i)+2;
            img.style.position = 'fixed';
            img.style.left = pos.left-HORSE_LEFT_OFFSET;
            img.style.top = pos.top-20;
            img.src = "horsey.png";
            img.onmouseover = onHorseEnter;
            img.onmouseleave = onHorseLeave;
            scale = window.innerHeight/160/5;
            img.height = Math.floor(160*scale);
            img.width = Math.floor(140*scale);
            wave.appendChild(img);
        }
    }());

    function updateHorseScore (horse, score) {
        var horse = document.getElementById('horse_'+horse),
            pos = getPosition(horse, score);
        horse.style.left = pos.left-HORSE_LEFT_OFFSET;
    };

    (function simulateRace () {
        var myTimer;

        myTimer = window.setInterval(function updateScores() {
            var i, horse, points;
            for (i = 1; i <= horseCount; i++) {
                if (Math.random() < 0.5-i*0.1) {
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
        }, 3000);
    })();
}());
