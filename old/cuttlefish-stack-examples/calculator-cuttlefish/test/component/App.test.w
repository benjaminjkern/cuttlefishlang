import 'cuttlefish-test' # Import everything into local scope such as it, validate
testRender = import 'cuttlefish-ui'

it "renders without crashing":
    testRender import '~/component/App'
