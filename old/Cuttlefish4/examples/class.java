public class MainClass
{
    public boolean _booleanField;
    public SubClass _SubClassField;
    public String _StringField;

    public MainClass(int intPar1)
    {
        _booleanField = intPar1 > 0 ? true : false;
        _SubClassField = new SubClass((short)0);
    }
        public MainClass(int intPar1, SubClass SubClassPar2)
    {
        _booleanField = intPar1 > 0 ? true : false;
        _SubClassField=SubClassPar2;
    }
        public int function1()
    {
        if (_SubClassField._byteArrayField == null)
            return 0;
        else
            return _SubClassField._byteArrayField.length;
    }
        public SubClass function2(int intPar1)
    {
        SubClass returnValue = new SubClass(2);
        for (int index = 0; index < 5; index++)
        {
            returnValue._byteArrayField[index] = (byte)intPar1;
        }
        return returnValue;
    }
        public char function2(short[] shortArrayPar1)
    {
        return 'A';
    }
        public void function3(int intPar1)
    {
        _StringField = "Value " + intPar1 + "was passed";
    }
        public byte[] function4(SubClass SubClassPar1, String StringPar2)
    {
        _StringField = StringPar2;
        return SubClassPar1._byteArrayField;
    }
}