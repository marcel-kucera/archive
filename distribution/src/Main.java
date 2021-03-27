import java.util.Arrays;

public class Main {

    static Student[] students;

    public static void main(String[] args) {

        //Set evolution vars
        int perGeneration = 1000;
        int cullDivide = 10;
        double mutRate = 0.03;
        int totalGenerations = 10000;
        int printEveryGenerations = 1000;


        //Set student vars
        int studentsTotal = 100;
        Student.classesTotal = 33;
        Student.joinedClasses = 10;

        //Init
        students = new Student[studentsTotal];
        int children = cullDivide - 1;
        if ((double) perGeneration / (double) cullDivide % 1 != 0) {
            System.out.println("ERROR: perGeneration should be cleanly divisible with cullDivide!");
            System.exit(0);
        }

        //Build Student Array
        for (int i = 0; i < students.length; i++) {
            students[i] = new Student();
        }

        //Build 100 random parents
        //Parent represents a possible week allocation
        int[][] parents = new int[perGeneration][studentsTotal];
        for (int i = 0; i < parents.length; i++) {
            for (int j = 0; j < parents[i].length; j++) {
                parents[i][j] = (int) Math.round(Math.random());
            }
        }

        //Evolution loop
        for (int generation = 0; generation < totalGenerations; generation++) {
            //Get (perGeneration - perGeneration / cullDivide) weakest parents
            //Parents considered for deletion. First Value = index in array ; Second Value = Fitness
            int[][] toDelete = new int[perGeneration - perGeneration / cullDivide][2];
            //Iterate through all parents and compare with parents considered for deletion
            int indexOfFittest = 0;
            for (int i = 0; i < parents.length; i++) {
                double distValue = getFitnessValue(parents[i]);

                //Replace better parent if it is considered for deletion
                if (toDelete[indexOfFittest][1] < distValue) {
                    toDelete[indexOfFittest][0] = i;
                    toDelete[indexOfFittest][1] = (int) distValue;

                    //Find new fittest parent considered for deletion
                    indexOfFittest = 0;
                    for (int j = 0; j < toDelete.length; j++) {

                        if (toDelete[indexOfFittest][1] > toDelete[j][1]) {
                            indexOfFittest = j;
                        }
                    }
                }
            }

            //Delete weakest Parents
            for (int[] ints : toDelete) {
                parents[ints[0]] = null;
            }

            //Get indices of remaining Parents
            int[] newParentsIndices = new int[perGeneration / cullDivide];
            int currentParent = 0;
            for (int i = 0; i < parents.length && currentParent < newParentsIndices.length; i++) {
                if (parents[i] != null) {
                    newParentsIndices[currentParent] = i;
                    currentParent++;
                }
            }

            //Create new Children
            for (int newParentsIndex : newParentsIndices) {

                int remainingChildren = children;
                for (int j = 0; j < parents.length && remainingChildren > 0; j++) {
                    if (parents[j] == null) {
                        parents[j] = mutate(parents[newParentsIndex], mutRate);
                        remainingChildren--;
                    }
                }
            }

            //Print statistics
            if (generation % printEveryGenerations == 0) {
                //Calculate average
                int totalDist = 0;
                for (int[] parent : parents) {
                    totalDist += getFitnessValue(parent);
                }
                int avgDist = totalDist / parents.length;
                System.out.println("Average fitness of all parents: " + avgDist);

                System.out.println("Total fitness of parent 0: " + getFitnessValue(parents[0]));
                System.out.println("Dist Values of parent 0:   " + Arrays.toString(getDistributionValues(parents[0])));
                System.out.println("Weekly distribution:");
                System.out.println("Week:0");
                System.out.println(Arrays.toString(getWeekStudentAmount(0, parents[0])));
                System.out.println("Week:1");
                System.out.println(Arrays.toString(getWeekStudentAmount(1, parents[0])));
                System.out.println("-----------------------------------------------------------------------------------------------------------------------------------");
            }
        }


    }

    //Randomly mutate week allocation
    public static int[] mutate(int[] array, double mutRate) {
        int[] newArray = new int[array.length];
        for (int i = 0; i < array.length; i++) {
            if (Math.random() < mutRate) {
                newArray[i] = array[i] == 0 ? 1 : 0;
            } else {
                newArray[i] = array[i];
            }
        }
        return newArray;
    }

    //Generate average loss for a week allocation
    public static double getFitnessValue(int[] weekAlloc) {
        double totalValue = 0;
        for (double value : getDistributionValues(weekAlloc)) {
            totalValue += value;
        }
        return Math.round(totalValue / Student.classesTotal * 100) / 100.0;
    }

    //Generate loss for uneven class distribution
    public static long[] getDistributionValues(int[] weekAlloc) {
        int[] classMemberAmount0 = getWeekStudentAmount(0, weekAlloc);
        int[] classMemberAmount1 = getWeekStudentAmount(1, weekAlloc);
        long[] distributionValue = new long[Student.classesTotal];

        for (int i = 0; i < Student.classesTotal; i++) {
            int totalClassesMembers = classMemberAmount0[i] + classMemberAmount1[i];
            //Exponentially increase loss
            //Loss is a value from 0 (perfectly distributed) to "a lot" (all students are on one week)
            distributionValue[i] = Math.round(Math.pow(1.25, Math.abs((double) classMemberAmount0[i] / (double) totalClassesMembers - 0.5) * 200) - 1);
        }
        return distributionValue;
    }

    //Get number of students in a week
    public static int[] getWeekStudentAmount(int week, int[] weekAlloc) {
        int[] classMembersNum = new int[Student.classesTotal];

        for (int i = 0; i < students.length; i++) {
            if (weekAlloc[i] == week) {
                for (int j = 0; j < students[i].classes.length; j++) {
                    classMembersNum[students[i].classes[j]]++;
                }
            }
        }
        return classMembersNum;
    }
}

class Student {

    public static int classesTotal = 5;
    public static int joinedClasses = 3;
    int[] classes;

    public Student() {
        classes = new int[joinedClasses];
        addRandomClasses();
    }

    public void addRandomClasses() {
        for (int i = 0; i < classes.length; i++) {
            classes[i] = (int) (Math.random() * classesTotal);
        }
    }
}