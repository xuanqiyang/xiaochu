;
(function() {
    //@static Object
    var Game = {
        hard: 6, //游戏难度:初始为六个方块,随时间增加难度
        TimeLimt: 60 * 1000, //游戏时间限制, 默认为1分钟
        liveTime: this.TimeLimt, //还剩多少时间
        MapSize: 8, //地图大小:行列大小, 为正方形
        score: 0, //得分成绩
        //component
        component: {
            mapEle: null,
            mapCellList: null,
            blocksEle: null,
            gameBoxEle: null,
            gameEle: null,
            timeLimtBar: null,
            scoreEle: null,
        }
    };
    //@static Object
    var Block = {
        Width: 70,
        Weight: 70
    };
    var Map = {
        firstChoose_indexOfBlock: -1, //初次选中的Block所映射的Map元素索引
        twiceChoose_indexOfBlock: -1, //要交换的Block所映射的Map元素索引
        MapCols: Game.MapSize,
        MapRows: Game.MapSize,
        isDeadMap: false,
        createmap: function() {
            // var mapEleFrag = document.createDocumentFragment();
            for (var mapCellIndex = 0; mapCellIndex < Map.MapCols * Map.MapRows; mapCellIndex++) {
                var mapCell = document.createElement('li');
                var block = Map.createBlock();
                Game.component.mapEle.appendChild(mapCell);
                mapCell.innerText = -1;
                mapCell.index = mapCellIndex;
                mapCell.forBlock = block;
                Game.component.blocksEle.appendChild(mapCell.forBlock);
            }
            firstRender = true;
            Map.loopFallBlock();
        },
        clearBlock: function(block) {
            Game.component.blocksEle.removeChild(block);
        },
        createBlock: function(top, left) {
            /*factory
             **创建单个方块
             **
             **/
            var block = document.createElement('li');
            block.style.top = parseFloat(top) + 'px';
            block.style.left = parseFloat(left) + 'px';
            return block;
        },
        checkBlock: function(block, value) {
            return block.innerText == value;
        },
        fallBlock: function(index) {
            /**在地图从每一列最后一个开始填充方块block
             **
             */
            var col = index % Map.MapCols; //索引所在第几列 0-7
            var row = (index - col) / Map.MapCols; //索引所在第几行 0-7
            //获取每一列的第一个方块的定位top,left
            var _offsetTop = Game.component.mapCellList[col].forBlock.style.top;
            var _offsetLeft = Game.component.mapCellList[col].forBlock.style.left;
            // console.log(_offsetTop, _offsetLeft)
            // console.log(Game.component.mapCellList[index].forBlock)
            //清除方块
            Map.clearBlock(Game.component.mapCellList[index].forBlock); //!!!
            /*从被消除的方块所在行row开始下沉方块
            **横向消除比纵向消除开销大很多
            **越接近底部开销越大
            */
            for (var i = row; i; i--) {
                // console.log(Game.component.mapCellList[i * 8 + col].forBlock, Game.component.mapCellList[(i - 1) * 8 + col].forBlock)
                Game.component.mapCellList[i * 8 + col].innerHTML = Game.component.mapCellList[(i - 1) * 8 + col].innerHTML;
                Game.component.mapCellList[i * 8 + col].forBlock = Game.component.mapCellList[(i - 1) * 8 + col].forBlock;
            }
            //生成新方块,填充缺失位置
            var block = Map.createBlock(parseFloat(_offsetTop) - Block.Height, _offsetLeft);
            var valueOfBlock = parseInt(Math.random() * 6);
            block.className = 'block-' + valueOfBlock;
            Game.component.blocksEle.appendChild(block);
            Game.component.mapCellList[col].forBlock = block;
            Game.component.mapCellList[col].innerHTML = valueOfBlock;
            if(!firstRender){
                // Game.component.mapCellList[col].forBlock.style.backgroundColor= 'red'
                console.log(block,valueOfBlock)
            }
            // block.style.left = _offsetLeft;
            // block.style.top = parseFloat(_offsetTop) - Block.Height + 'px';

        },
        loopFallBlock: function() {
            /*按顺序横向扫描遍历整个地图,查看是否存在可消除方块
            **消除并对每一列的方块执行下落操作
            */
            for (var i = 0; i < Map.MapCols; i++) {
                for (var j = 0; j < Map.MapRows; j++) {
                    if (Map.checkBlock(Game.component.mapCellList[Map.MapRows * j + i], -1)) {
                        Map.fallBlock(Map.MapRows * j + i); //!!!

                    }
                }
            }
            //按地图单元格对地图所映射的方块的定位排版
            for (i = 0; i < Map.MapCols * Map.MapRows; i++) {
                Game.component.mapCellList[i].forBlock.style.top = parseFloat(Game.component.mapCellList[i].offsetTop) - Game.GameEleTop + 'px';
                Game.component.mapCellList[i].forBlock.style.left = parseFloat(Game.component.mapCellList[i].offsetLeft) - Game.GameEleLeft + 'px';
            }
            //判断是否存在可消除的方块
            Game.TimerLoopFallBlock = setTimeout(function() {
                Map.isDeadMap = Map.searchAllBeClearBlocks(); //!!!
            }, 1000);
            firstRender = false;
        },
        searchAllBeClearBlocks: function() {
            // startTime = new Date().getMilliseconds();
            var allBeClearBlocks = [];
            var beClearBlocks = [];
            for (var i = 0; i < Map.MapCols * Map.MapRows; i++) {
                if (beClearBlocks = Map.searchBeClearBlocks(i)) {
                    allBeClearBlocks = allBeClearBlocks.concat(beClearBlocks);
                }
            }
            if (allBeClearBlocks.length == 0) {
                return false;
            }
            for (i = 0; i < allBeClearBlocks.length; i++) {
                allBeClearBlocks[i].innerHTML = -1;
            }
            // debugger;
            // console.log(allBeClearBlocks.length)
            Map.loopFallBlock(); //!!!
            // endTime = new Date().getMilliseconds();
            // console.log(endTime - startTime);
            return true;
        },
        searchBeClearBlocks: function(index) {
            if (Game.component.mapCellList[index].innerHTML == -1) {
                return [];
            }
            var col = index % Map.MapCols;
            var row = (index - col) / Map.MapCols;
            var beClearBlocks = [];

            beClearBlocks.push(Game.component.mapCellList[index]);
            if (col != 0 && col != Map.MapCols - 1) {
                if (Game.component.mapCellList[index].forBlock.className == Game.component.mapCellList[index - 1].forBlock.className &&
                    Game.component.mapCellList[index].forBlock.className == Game.component.mapCellList[index + 1].forBlock.className) {
                    beClearBlocks.push(Game.component.mapCellList[index - 1]);
                    beClearBlocks.push(Game.component.mapCellList[index + 1]);
                }
            }
            if (row != 0 && row != Map.MapRows - 1) {
                if (Game.component.mapCellList[index].forBlock.className == Game.component.mapCellList[index - Map.MapCols].forBlock.className &&
                    Game.component.mapCellList[index].forBlock.className == Game.component.mapCellList[index + Map.MapCols].forBlock.className) {
                    beClearBlocks.push(Game.component.mapCellList[index - Map.MapCols]);
                    beClearBlocks.push(Game.component.mapCellList[index + Map.MapCols]);
                }
            }

            if (beClearBlocks.length >= 3) {
                return beClearBlocks;
            } else {
                return [];
            }
        },
        switch2Blocks: function(firstChoose, twiceChoose) {
            //交换两个方块的位置
            var temp;
            var firstChoose_valueOfBlock = Game.component.mapCellList[firstChoose].innerHTML;
            var twiceChoose_valueOfBlock = Game.component.mapCellList[twiceChoose].innerHTML;

            Game.component.mapCellList[firstChoose].innerHTML = twiceChoose_valueOfBlock;
            Game.component.mapCellList[twiceChoose].innerHTML = firstChoose_valueOfBlock;

            temp = Game.component.mapCellList[firstChoose].forBlock;
            Game.component.mapCellList[firstChoose].forBlock = Game.component.mapCellList[twiceChoose].forBlock;
            Game.component.mapCellList[twiceChoose].forBlock = temp;
            //调换方块位置后,如果没有可消除的方块存在,则重新恢复双方的本来位置
            if (!Map.searchAllBeClearBlocks()) {
                Game.component.mapCellList[firstChoose].innerHTML = firstChoose_valueOfBlock;
                Game.component.mapCellList[twiceChoose].innerHTML = twiceChoose_valueOfBlock;

                temp = Game.component.mapCellList[firstChoose].forBlock;
                Game.component.mapCellList[firstChoose].forBlock = Game.component.mapCellList[twiceChoose].forBlock;
                Game.component.mapCellList[twiceChoose].forBlock = temp;
            }
        },
        isSwitchable: function(firstChoose, twiceChoose) {
            if (twiceChoose == firstChoose - Map.MapCols) {
                console.log('上边')
                return true;
            } else if (twiceChoose == firstChoose + Map.MapCols) {
                console.log('下边')
                return true;
            } else if (twiceChoose == firstChoose - 1 && twiceChoose % Map.MapCols == firstChoose % Map.MapCols - 1) {
                console.log('左边')
                return true;
            } else if (twiceChoose == firstChoose + 1 && twiceChoose % Map.MapCols == firstChoose % Map.MapCols + 1) {
                console.log('右边')
                return true;
            }
            return false;
        }
    };
    Game.initGame = function() {
        Game.component.mapEle = document.getElementById('map');
        Game.component.mapCellList = Game.component.mapEle.children;
        Game.component.blocksEle = document.getElementById('blocks');
        Game.component.gameBoxEle = document.getElementById('gameBox');
        Game.component.gameEle = document.getElementById('game');
        Game.component.timeLimtBar = document.getElementById('timeLimtBar');
        Game.component.scoreEle = document.getElementById('score');
        Game.GameEleTop = Game.component.gameEle.style.top;
        Game.GameEleLeft = Game.component.gameEle.style.left;
        Map.createmap();
        Game.component.mapEle.addEventListener('mousedown', function(event) {
            var firstChoose_mapCell = event.target;
            if (Map.firstChoose_indexOfBlock == -1) {
                Map.firstChoose_indexOfBlock = event.target.index;
                firstChoose_mapCell.classList.add('block-first-choose');
            } else {
                Map.twiceChoose_indexOfBlock = event.target.index;
                if (Map.isSwitchable(Map.firstChoose_indexOfBlock, Map.twiceChoose_indexOfBlock)) {
                    Map.switch2Blocks(Map.firstChoose_indexOfBlock, Map.twiceChoose_indexOfBlock);
                }
                Map.firstChoose_indexOfBlock = -1;
                for (var i = 0; i < Map.MapRows * Map.MapCols; i++) {
                    Game.component.mapCellList[i].classList.remove('block-first-choose')
                }
            }
        }, false);
    };
    //辅助函数
    //数组去重
    Array.prototype.unique = function(){
        var result = [];
        var self = this;
        this.forEach(function(v, i){
            if(self.indexOf(v, i+1) == -1){
                result.push(v);
            }
        })
        return result;
    }
    //main
    window.onload = function() {
        Game.initGame()
    }
})();