//förkortad document ready-funktion
$(function() {
    //GLOBALS (nåja relativt globala)
    let currFieldColor = 'none';
    let currFieldTxt = '';
    let currSound = '';
    let oldNote = '';
    let latest_index = false;
    let btnSpan;

    let gameOn = false;
    let gameStarted = false;
    let lvl;
    let p;
    let maxTone, randTone, toneToGuess, played;
    let hearSound, seeColor, seeName;
    let startOverDelay;
    let soundStatus = 'on';
    let colorStatus = 'on';
    let nameStatus = 'on';
    let randCorrect, randWrong;
    
    let guessToneDelay1, guessToneDelay2;

    let correctShout = [
        'is correct!',
        'is your friend!',
        'is the one!',
        'is correct, nice!',
        'is correct, sweet!',
        'is exactly right!',
        'is correct, oh yes!'
    ];

    let wrongShout = [
        'was wrong.',
        'was wrong, sorry.',
        'was wrong, try again.',
        'was not correct.',
        'was not the one'
    ];

    //osynlig knapp för att köra nästa fråga
    $('#nextToneBtn').click(function(){
        //alert('next question');
        //playSound('c2');
        guessTone();
        
    });
    
    //startar i övningsläge!
    practiseMode();


    /***MODE SWITCH (practise vs game)***/
    $('#modeBtn').click(function(){
        //om vi är i övningsläge, gå till spelläge
        if(!gameOn){
            oldNote = '';
            gameOn = true;
            lvl = 0;
            p = 0; //onödig men men...
            $('#modeBtn').text('GAME is ON!')
                .addClass('gameON', 400);

            //dölj logo
            $('#logo').hide();

            //gå till gissa ton-func
            guessTone();
            //om vi är i spelläge, gå till övningsläge
            }else{
                $('.white, .black').off('click');//avtrigga tangentlyssnare

                //nollställ resultat och layout/innehåll
                gameOn = false;
              
                lvl = 0;
                p = 0;
                $('#colorField').css('background', 'none');
                $('#fieldTxt').text('')
                    .css('color', 'black')
                        .css('font', "normal 3em 'Righteous', cursive");

                $('#modeBtn').html('GAME is OFF')
                    .removeClass('gameON')
                        .removeClass('gameON', 0);


                //visa logo
                $('#logo').show();

                $('#colorField').stop().animate();
                //$('#fieldTxt').stop().animate();


                //avbryt eventuell endGame()-process
                if(startOverDelay){
                    clearTimeout(startOverDelay);
                }

                //avbryt ny fråga-animation
                //clearTimeout(guesToneDelay2);
                //clearTimeout(guesToneDelay1);
                practiseMode();
            }
        });


    /***PRACTISE MODE***/
    function practiseMode(){
        if(!gameOn){
            //lyssna till pianoklick
            $('.white, .black').on('click', function(){
                //dölj logo
                $('#logo').hide();
                
                //visa txt
                $('#fieldTxt').css('display', 'block');
                
                //använd snyggare varnamn
                played = this.id;

                //hämta rätt färg
                if(colorStatus === 'on'){
                    $('#colorField').css('background', getColor(played)); 
                }else{
                     $('#colorField').css('background', 'none');
                }
                
                //visa tonnamn i html
                if(nameStatus === 'on'){
                    $('#fieldTxt').text(played);
                }else{
                    $('#fieldTxt').text('');
                }

                //justera fieldTxt om mörk bg
                if(colorStatus === 'on'){
                    if(played == 'fiss1'||
                        played == 'bess'||
                            played == 'bess1'){
                        $('#fieldTxt').css('color', 'whitesmoke');
                    }else{
                        $('#fieldTxt').css('color', 'black');
                    }
                }else{
                    $('#fieldTxt').css('color', 'black');
                }

                //spela ljud
                if(soundStatus === 'on'){
                    playSound(played);
                }

            });
        }
    }


    /***GAME MODE***/

    //STÄLL FRÅGA
    function guessTone(){
        if(gameOn){
            $('.white, .black').off('click'); ////avtrigga för säkerhetsskull
            
     
            //dra fram tonnamn lite smooth tonnamn
            $('#fieldTxt').slideUp(0).show(500);
            
            
            //nästa level
            lvl++;

            //välj ut en ton: 
            //maxvärde är antal möjliga toner/tangenter
            maxTone = ($('.white').length) + ($('.black').length);
            //deklarera randomvärde (mellan 0 och max) med math.random 
            
            //välj ton, men undvik senaste 
            //(borde lägga i array-stack och exkludera latest_index för att förhindra evighets-loop men...)
            randTone = pick_new_tone();
            function pick_new_tone(randTone){
                var chosen = Math.floor(Math.random() * (maxTone));
                if(chosen === latest_index){
                    console.log('Chose the same note ('+$('.white, .black')[chosen].id+'), picking new...');
                    return pick_new_tone();
                }else{
                    latest_index = chosen;
                    return chosen;
                }
            }
            
            console.log('randTone: '+$('.white, .black')[randTone].id+'\n latest index: '+latest_index);

            
            //ta fram ton utifrån random-värdet
            toneToGuess = $('.white, .black')[randTone].id;
            
            //hantera svar
            handleAnswer(toneToGuess);
            
            //spela ljud
            if(soundStatus === 'on'){
                playSound(toneToGuess);
            }
            
            
            
            
            //om namnstatus på, visa namn
            if(nameStatus === 'on'){
                $('#fieldTxt').html('find <span id="theTone">'+toneToGuess+'</span>')
                    .css('font-size', '1.5em');
                $('#theTone').css('font-size', '2em');
            }else{
                //om namnstatus inte på, visa aktuell oktav
                //variabel för aktuell tons sista tecken
                let lastChar = toneToGuess.substr(toneToGuess.length -1);
                
                //skriv ut aktuell oktav
                //matcha med sista tecknet i tonnamnet för att identifiera aktuell oktav   
                if(lastChar === '1'){
                    $('#fieldTxt').html('?<span id="octaveHtml">(middle oct)</span>');
                }else if(lastChar === '2'){
                    $('#fieldTxt').html('?<span id="octaveHtml">(2 line oct)</span>');
                }else{
                    $('#fieldTxt').html('?<span id="octaveHtml">(small oct)</span>');
                }     

                //justera txt.layout
                $('#fieldTxt').css('font-size', '3em')
                    .css('color', 'black');
                $('#octaveHtml').css('font-size', '.4em');
                
                //om ton är unik, skippa oktavhint
                if(toneToGuess === 'f1' ||
                    toneToGuess === 'fiss1' ||
                    toneToGuess === 'g1' ||
                    toneToGuess === 'giss1'){
                $('#fieldTxt').html('?')
                    .css('font-size', '3em');//.html ist för .text för att stryka över ev <span> (kanske onödigt)
                }             
            }

            //om mörk färg, ljusa upp txt
            if(colorStatus === 'on'){    
                if(toneToGuess == 'fiss1'||
                    toneToGuess == 'bess'||
                        toneToGuess == 'bess1'){
                    $('#fieldTxt').css('color', 'whitesmoke');
                }else{
                    $('#fieldTxt').css('color', 'black');
                }
            }else{
                $('#fieldTxt').css('color', 'black');
            }

            //hämta rätt färg
            if(colorStatus === 'on'){
                $('#colorField').animate({backgroundColor: getColor(toneToGuess)}, 800);  
            }else{
                $('#colorField').css('background', 'none');
            }
            
            
        }//if gameON
    }

    //ANALYSERA SVAR
    function handleAnswer(correct){
        //TA IN USER_SVAR
        $('.white, .black').on('click', function(){
            
            //snyggare varnamn
            played = this.id;
            
            //pausa ringande ton när gissning sker
            $(currSound).trigger('pause')
                .prop('volume', 0)
                    .prop('currentTime', 0)
                        .prop('volume', 1);
            
            $('.white, .black').off('click'); //avtrigga bara för säkerhetsskull

            /*//om ljudläge på, spela ljud
            if(soundStatus === 'on'){    
                //spela ljud
                playSound(played);
            }*/
            
            //pausa spola tillbaka
            /*$(this).trigger('pause')
                        .prop('currentTime', 0);*/

            //skapa randomvärde för lite varierande feedback till user
            randCorrect = Math.floor(Math.random() * (correctShout.length));

            randWrong = Math.floor(Math.random() * (wrongShout.length));

            
       
           
            
            //OM RÄTT TON, meddela och ge poäng
            if(played === correct){
                //anpassa feeback efter name-status
                if(nameStatus === 'on'){
                    $('#fieldTxt').html('<span id="playedHtml">'+played+'</span> '+correctShout[randCorrect])
                        .css('color', 'black')
                            .css('font-size', '1.5em');

                    $('#playedHtml').css('font-size', '2em');
                    //samt color-status
                    if(colorStatus === 'on'){
                        $('#playedHtml').css('color', getColor(played));
                    }else{ 
                        $('#playedHtml').css('color', 'black');
                    } 
                }else{
                    $('#fieldTxt').text('correct!')
                        .css('font-size', '2em')
                            .css('color', 'black');
                }

                $('#colorField').css('background', 'none');
                p++;
            //OM FEL TON, skriv meddelande
            }else{
                //anpassa feeback efter name-status
                if(nameStatus === 'on'){
                    $('#fieldTxt').html('<span id="playedHtml">'+played+'</span> '+wrongShout[randWrong])
                        .css('color', 'black')
                            .css('font-size', '1em');

                    $('#playedHtml').css('font-size', '2em');
                    //samt color-status
                    if(colorStatus === 'on'){
                        $('#playedHtml').css('color', getColor(played));
                    }else{
                        $('#playedHtml').css('color', 'black');
                    }   
                }else{
                    $('#fieldTxt').text('that '+wrongShout[randWrong])
                        .css('color', 'black')
                            .css('font-size', '1.5em');
                }
                $('#colorField').css('background', 'none');

            }
            //efter 1 sek, återställ rubrik och kör nästa fråga, fast efter 8 frågor, avsluta
            guessToneDelay1 = setTimeout(function(){
                    if(lvl < 8){
                        console.log('lvl '+lvl+' done.');
                        gameStarted = true;
                        $('#nextToneBtn').click();
                        //guessTone();
                    }else{
                        endGame();
                    }     
            }, 1000);
        
        
                
               
     

        });
                        
    }//handleAnswer


    //AVSLUTA SPEL
    function endGame(){
        //konvertera poäng till %
        p = (p/lvl*100).toFixed(1);

        $('.white, .black').off('click'); //avtrigga piano
        
        //styla/tagga poäng-txt
        $('#colorField').css('background', 'none');
        $('#fieldTxt').html('<span id="pHtml">'+p+'</span> % accuracy!')
            .css('color', 'black')
                .css('font-size', '1.5em');
        $('#pHtml').css('color', 'red')
            .css('font-size', '2em');
        
        //visa
        $('#fieldTxt').show(300);

        $('#modeBtn').removeClass('gameON', 3000);
        
        //efter 2,4 sek, nollställ gå tillbaka till ursprungsläge
        startOverDelay = setTimeout(function(){
            $('#fieldTxt').css('display', 'none');
            $('#logo').css('display', 'block')
                .css('margin', '-2.5vw auto');
            $('#modeBtn').text('GAME is OFF')
                
            gameOn = false;
            gameStarted = false;
        
            //nollställ ton-html
            $('#fieldTxt').html('')
                .css('font-size', '3em')
                    .css('color', 'black');
            
            
            practiseMode();
        }, 2400);  
    }




/*** STANDARD-FUNKTIONER ***/

    //FÄRGSCHEMA
    function getColor(noteName){
        //alla vita tangenter (matcha första tecknet)
        switch (noteName.charAt(0)){
            case 'a':
                currFieldColor = 'red';
                break;
            case 'b':
                currFieldColor = '#e0e0eb';
                break;
            case 'c':
                currFieldColor = '#fff300';
                break;
            case 'd':
                currFieldColor = '#ff9900';
                break;
            case 'e':
                currFieldColor = '#4da6ff';
                break;
            case 'f':
                currFieldColor = '#00e64d';
                break;
            case 'g':
                currFieldColor = '#d580ff';
                break;
        }
        //alla svarta tangenter (matcha hela parametervärdet)
        switch (noteName){
            case 'bess':
            case 'bess1':
                currFieldColor = '#330a00';
                break;
            case 'ciss1':
            case 'ciss2':
                currFieldColor = '#dec903';
                break;
            case 'ess1':
            case 'ess2':
                currFieldColor = '#0077b3';
                break;
            case 'fiss1':
                currFieldColor = '#267326';
                break;
            case 'giss1':
                currFieldColor = '#b30086';
                break;
        }
        return currFieldColor;
    }

    //LJUD-UPPSPELAREN
    function playSound(note){
        //deklarera aktuellt ljudfils-namn
        currSound = '#SOUND' + note;
        var curr_id = 'SOUND'+note;
        console.log('playing '+note);

        //spela aktuell ton
        try{
            
            
            
            //if(!gameOn && oldNote == currSound){
            
            //stoppa föregående ton
            /*if(oldNote !== ''){
                $(oldNote).trigger('pause')//stoppa anim
                    .prop('currentTime', 0)
                        .prop('volume', 1);
                console.log('muted '+oldNote);
            }*/
            
            
            //om samma ton: snabb fade-out, stoppa anim, spola tillbaks, defaultvolym, spela
            $('#temp_audio').trigger('stop')//stoppa anim
                .prop('currentTime', 0)
                .animate({
                    volume: 0
                }, 20);
            
            
            //rensa och skapa nya audio-element (för att se om play funkar på mobil)
            if($('#temp_audio').length){
                $('#temp_audio').remove();
            }
            
            $('body div').first().prepend('<audio id="temp_audio" note="'+note+'"><source src="AUDIO/oggs/'+curr_id+'.ogg"><source src="AUDIO/mp3s/'+curr_id+'.mp3"></audio>')

            setTimeout(function() {
                $('#temp_audio').prop('volume', 1)
                            .prop('currentTime', 0)
                            .trigger('play');
                /*$(currSound).append('<source src="AUDIO/oggs/'+curr_id+'.ogg">');
                $(currSound).append('<source src="AUDIO/mp3s/'+curr_id+'.mp3">');
                
                //alert('spelar ton...'+currSound);
                $(currSound).prop('volume', 1)
                            .prop('currentTime', 0)
                            .trigger('play');*/
            }, 36); 
            
            
            
            
           /* }else{
            //om övningsläge och ny ton: spola tillbaks, defaultvolym, spela, långfade-out
                alert('playing sound');
                $(currSound).prop('currentTime', 0)
                    .prop('volume', 1)
                            .trigger('play')
                                .animate({
                                    volume: 0
                                }, 1000);
            }*/

            //registrera spelad ton för igenkänning nästa gång
        setTimeout(function() {
            oldNote = currSound;
        }, 37);
        }catch (err) {
        //om play-error
            $('#fieldTxt').append(' (sound error)');
        }
        
    }



    //HANDIKAPP/SVÅRIGHETSGRADER
    $('#soundBtn, #colorBtn, #nameBtn').on('click', function(){
        //slå av på setting-status
        //mjuka upp med liten anim via addClass
        //(lite väl mkt kod för liten effekt. Ville hitta nåt sätt att sätta on/off-status för varje knapp utan att behöva kolla dem en och en, men kom inte på nåt sätt i stundens hetta)
        
        //deklarera aktuellt span-innehåll
     btnSpan = this. children[0];
        
        //justera on/off
        if(btnSpan.innerHTML === 'on'){
            btnSpan.innerHTML = 'off';
            $(this).addClass('offBtn', 500, 'easeOutBounce');
            switch(this.id){
                case 'soundBtn':
                    soundStatus = 'off';
                    break;
                case 'colorBtn':
                    colorStatus = 'off';
                    break;
                case 'nameBtn':
                    nameStatus = 'off';
                    break;
            }
        }else{
            btnSpan.innerHTML = 'on'; 
            $(this).removeClass('offBtn');
            switch(this.id){
                case 'soundBtn':
                    soundStatus = 'on';
                    break;
                case 'colorBtn':
                    colorStatus = 'on';
                    break;
                case 'nameBtn':
                    nameStatus = 'on';
                    break;
            }
        }
        
        
        
        /*
        if(this.id === 'soundBtn'){
            if(soundStatus == 'on'){
                $(this).text('sound off')
                    .addClass('offBtn', 500, 'easeOutBounce');
                soundStatus = 'off';
            }else{
                $(this).text('sound on')
                    .removeClass('offBtn');
                soundStatus = 'on';
            }
        }else if(this.id === 'colorBtn'){
            if(colorStatus == 'on'){
                $(this).text('color off')
                    .addClass('offBtn', 500, 'easeOutBounce');
                colorStatus = 'off';
            }else{
                $(this).text('color on')
                    .removeClass('offBtn');
                colorStatus = 'on';
            }
        }else if(this.id === 'nameBtn'){
            if(nameStatus == 'on'){
                $(this).text('name off')
                    .addClass('offBtn', 500, 'easeOutBounce');
                nameStatus = 'off';
            }else{
                $(this).text('name on')
                    .removeClass('offBtn');
                nameStatus = 'on';
            }
        }*/
        
    });
    
    
}) //doc ready hejdå