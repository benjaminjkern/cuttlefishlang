# Need to put this inside of bashrc

export CUTTLEFISH_ROOT=$HOME/Documents/cuttlefishlang
function cuttle() {
    node $CUTTLEFISH_ROOT/src/index.js $@
}