# 2012 AMC 12A Problem 9

> This problem is the same as [2012 AMC 12A #9](https://artofproblemsolving.com/wiki/index.php/2012_AMC_12A_Problems) and [2012 AMC 10A #12](https://artofproblemsolving.com/wiki/index.php/2012_AMC_10A_Problems).
## Problem
A year is a leap year if and only if the year number is divisible by 400 (such as 2000) or is divisible by 4 but not 100 (such as 2012).  The 200th anniversary of the birth of novelist Charles Dickens was celebrated on February 7, 2012, a Tuesday.  On what day of the week was Dickens born?

$\textbf{(A)}\ \text{Friday}\qquad\textbf{(B)}\ \text{Saturday}\qquad\textbf{(C)}\ \text{Sunday}\qquad\textbf{(D)}\ \text{Monday}\qquad\textbf{(E)}\ \text{Tuesday}$
## Solution
In this solution we refer to moving to the left as decreasing the year or date number and moving to the right as  increasing the year or date number. Every non-leap year we move to the right results in moving one day to the right because $\equiv 1\pmod 7$.  Every leap year we move to the right results in moving $2$ days to the right since $\equiv 2\pmod 7$. A leap year is usually every four years, so 200 years would have $\frac{200}{4}=50$ leap years, but the problem says that 1900 does not count as a leap year.

Therefore there would be 151 regular years and 49 leap years, so $1(151)+2(49)=249$ days back.  Since $249 \equiv 4\ (\text{mod}\ 7)$, four days back from Tuesday would be $\boxed{\textbf{(A)}\ \text{Friday}}$.
## Solution 2
Since they say that February $7$th, $2012$ is the $200$th anniversary of Charles Dickens birthday, that means that the birth of Charles Dickens is on February $7$th, $1812$. We then see that there is a leap year on $1812, 1816, ...., 2008$ but we must exclude $1900$ which equates to $49$ leap years. So, the amount of days we have to go back is $200(365) + 49$ days which in $\text{mod }7$ gives us 4. Thus, $4$ days back from Tuesday is $\boxed{\textbf{(A)}\ \text{Friday}}$.
## Remark
The reason why there are 49 leap years:

$\quad$ There are 200 $\div$ 4  years which are divisible by 4. There are 2 years which are divisible by 100 within these 200 years. There is 1 year which is divisible by 400. Therefore , there are $\frac{200}{4} -2 + 1$ leap years.

*~JiYang*
## See Also
