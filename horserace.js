HorseRace = {};

(function app () {
    var scoreRange = 10,
        maxPoints = 45,
        OFFSET = 1,
        horserace = document.getElementById('horserace');

    function getPosition(waveNum, score, round) {
        var raceHeight = horserace.clientHeight,
            raceWidth = horserace.clientWidth,
            marginWidth = getHorseWidth(),
            scoreZone = raceWidth - marginWidth - 20,
            waveHeight = Math.floor(raceHeight/(getWaveCount()+OFFSET));
        return {
            left: round < 9 ? Math.floor(marginWidth + (score/scoreRange) * scoreZone)
                            : Math.floor(marginWidth + ((score-18)/(scoreRange-18)) * scoreZone),
            top: waveHeight*(waveNum+1)
        }
    }

    function updateTooltip (horse, horseInfo) {
        var tooltip = horse.parentNode.getElementsByClassName('tooltip')[0];
        tooltip.innerHTML = "Name: " + horseInfo.name + "<br>Score: " + horseInfo.score;
    }

    function calculatePositions(round) {
        var i, j, wave, waves, children, pos, stick, horse, marks, markpos,
            horseWidth = getHorseWidth();
        waves = document.getElementsByClassName('wave');
        for (i = 0; i < waves.length; i++) {
            pos = getPosition(i, 0, round);
            wave = waves[i];
            children = Array.prototype.slice.call(wave.children);
            wave.style.top = pos.top;
            wave.style.backgroundPosition = 0-20*i;
            stick = children.find(function(el) {return el.className === 'stick'});
            stick.style.left = stick.style.left || Math.floor(horseWidth/2);
            horse = children.find(function(el) {return el.className === 'horse'});
            horse.style.width = horse.style.height = horseWidth;
            horse.style.left = horse.style.left || 0;

            marks = children.filter(function(el){return el.className === 'scoremark'});
            for (j = 0; j < marks.length; j++) {
                markpos = getPosition(i, parseInt(marks[j].textContent, 10), round);
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
        horse.style.top = 0;
        if (horseInfo.img && !horseInfo.img.match('/')) {
            horseInfo.img = HorseRace.base + '/assets/race/' + horseInfo.img;
        }
        horse.src = horseInfo.img || "placeholder.png"
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
        tooltip.style.top = 0;
        tooltip.style.left = 100;
        tooltip.style.zIndex = 1;
        wave.appendChild(tooltip);

        horserace.appendChild(wave);
        updateTooltip(horse, horseInfo);
    }
    function removeWave (key, round) {
        document.getElementById('wave_' + key).remove();
        calculatePositions(round);
    }

    function getWaveCount() {
        return document.getElementsByClassName('wave').length;
    }
    function getHorseWidth() {
        return 1.2*Math.floor(horserace.clientHeight/(getWaveCount()+OFFSET));
    }

    function updateHorseScore (horse, horseInfo, round) {
        var pos = getPosition(0, horseInfo.score, round),
            stick = horse.parentNode.getElementsByClassName('stick')[0],
            tooltip = horse.parentNode.getElementsByClassName('tooltip')[0],
            horseWidth = getHorseWidth();
        stick.style.left = pos.left;
        horse.style.left = pos.left-Math.floor(horseWidth/2);
        tooltip.style.left = pos.left + (pos.left > horserace.clientWidth/2 ? +horseWidth/2+30 : -horseWidth/2-180);
        updateTooltip(horse, horseInfo);
    }

    function processScores(scorelist, round) {
        var maxScore = 0,
            waveKeys,
            roundDisplay = document.getElementById('horseround');

        if (!roundDisplay) {
            roundDisplay = document.createElement('span');
            roundDisplay.id = 'horseround';
            horserace.appendChild(roundDisplay);
        }
        if (round > 9) {
            roundDisplay.innerHTML = 'Day 2 Round ' + round;
        } else {
            roundDisplay.innerHTML = 'Day 1 Round ' + round;
        }

        waveKeys = Array.prototype.map.call(document.getElementsByClassName('wave'),
                function (w) { return w.id.replace('wave_', ''); });
        waveKeys.forEach(function (key) {
            if (scorelist.findIndex(function(h) { return h.key == key; }) === -1) {
                removeWave(key, round);
            }
        });
        scorelist.forEach(function (el) {
            if (!document.getElementById('wave_' + el.key)) {
                addWave(el);
            }
        });
        scorelist.forEach(function (el) {
            var wave = document.getElementById('wave_' + el.key);
            updateHorseScore(wave.getElementsByClassName('horse')[0], el, round);
        });
        scorelist.forEach(function (el) {
            maxScore = el.score > maxScore ? el.score : maxScore;
        });
        scoreRange = Math.min(maxScore-(maxScore%18)+18, maxPoints);
        calculatePositions(round);
    }

    function ajax(url, success) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState>3 && xhr.status==200) {
                var json = JSON.parse(this.responseText);
                success(json);
            }
        }
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send();
        return xhr;
    }

    function getRound(event, round) {
        if (HorseRace.inflight)
            HorseRace.inflight.abort();
        HorseRace.inflightRound = round;
        HorseRace.inflight = ajax(HorseRace.base + '/EventStanding/event/'+event+'/round/'+round, function(json) {
            processScores(json, round);
            HorseRace.inflightRound = undefined;
            HorseRace.inflight = undefined;
        });
    }

    HorseRace.replay = function (event, rounds) {
        var myTimer,
            round = 1,
            speed = window.location.search.match(/[?&]fast/) ? 300 : 1000;
        rounds = rounds || 15;

        getRound(event, round);
        myTimer = window.setInterval(function roundTimer() {
            round++;
            getRound(event, round);
            if (round === rounds) {
                window.clearInterval(myTimer);
            }
        }, speed);

        // watch for esc and arrow keys
        document.addEventListener('keydown', function(e) {
            var key = window.event ? e.keyCode : e.which,
                myRound = HorseRace.inflightRound || round,
                stop = function() {
                    window.clearInterval(myTimer);
                    if (HorseRace.inflight)
                        HorseRace.inflight.abort();
                };

            if (key === 27) { // ESC
                stop();
            }
            if (key === 37 || key === 39) { // left arrow, right arrow
                stop();
                round = (key === 37 ? myRound-1 : myRound+1);
                getRound(event, round);
                document.getElementById('horseround').innerHTML = 'Loading round ' + round + ' ...';
            }
        });
    }
}());
