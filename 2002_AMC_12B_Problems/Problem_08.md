# 2002 AMC 12B Problem 8

> This problem is the same as [2002 AMC 12B #8](https://artofproblemsolving.com/wiki/index.php/2002_AMC_12B_Problems) and [2002 AMC 10B #8](https://artofproblemsolving.com/wiki/index.php/2002_AMC_10B_Problems).
## Problem
Suppose July of year N has five Mondays. Which of the following must occur five times in the August of year N? (Note: Both months have 31 days.)

$\textrm{(A)}$\ $\text{Monday} \qquad \textrm{(B)}$\ $\text{Tuesday} \qquad \textrm{(C)}$\ $\text{Wednesday} \qquad \textrm{(D)}$\ $\text{Thursday} \qquad \textrm{(E)}$\ $\text{Friday}$
## Solution 1
If there are five Mondays, there are only three possibilities for their dates: (1,8,15,22,29), (2,9,16,23,30), and (3,10,17,24,31).

In the first case August starts on a Thursday, and there are five Thursdays, Fridays, and Saturdays in August.

In the second case August starts on a Wednesday, and there are five Wednesdays, Thursdays, and Fridays in August.

In the third case August starts on a Tuesday, and there are five Tuesdays, Wednesdays, and Thursdays in August.

The only day of the week that is guaranteed to appear five times is therefore $\boxed{\textrm{(D)}\ \text{Thursday}}.$
## Solution 2 (visualization)
A diagram can be constructed to visualize the possibilities for the dates. First, a 4x7 rectangle representing 28 days can be constructed with three extra cells on the bottom to represent the three extra days.

Then, the rest of the steps in Solution 1 can be followed.

For example, if the first of the bottom three cells is a Monday, it is clear that the following two days are Tuesday and Wednesday. This means that the new bottom three cells (as both months have 31 days) of August will be Thursday, Friday, and Saturday. This same process can be repeated so that the second cell is represented as Monday and so forth; then, the only day of the week that appears when all three cases are considered is $\boxed{\textrm{(D)}\ \text{Thursday}}.$

*~bearjere*
## See Also
