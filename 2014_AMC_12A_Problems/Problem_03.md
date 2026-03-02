# 2014 AMC 12A Problem 3

> This problem is the same as [2014 AMC 12A #3](https://artofproblemsolving.com/wiki/index.php/2014_AMC_12A_Problems) and [2014 AMC 10A #4](https://artofproblemsolving.com/wiki/index.php/2014_AMC_10A_Problems).
## Problem
Walking down Jane Street, Ralph passed four houses in a row, each painted a different color. He passed the orange house before the red house, and he passed the blue house before the yellow house. The blue house was not next to the yellow house. How many orderings of the colored houses are possible?

$\textbf{(A)}\ 2\qquad\textbf{(B)}\ 3\qquad\textbf{(C)}\ 4\qquad\textbf{(D)}\ 5\qquad\textbf{(E)}\ 6$
## Solution 1
Let's use casework on the yellow house. The yellow house $(\text{Y})$ is either the $\text{rd}$ house or the last house.

Case 1: $\text{Y}$ is the $\text{rd}$ house.

The only possible arrangement is $\text{B}-\text{O}-\text{Y}-\text{R}$

Case 2: $\text{Y}$ is the last house.

There are two possible arrangements:

$\text{B}-\text{O}-\text{R}-\text{Y}$

$\text{O}-\text{B}-\text{R}-\text{Y}$

The answer is $\boxed{\textbf{(B) } 3}$
## Solution 2 (symmetry)
There are $4!=24$ arrangements without restrictions. There are $3!\cdot2!=12$ arrangements such that the blue house neighboring the yellow house (calculating the arrangments of [$\text{BY}$], $\text{O}$, and $\text{R}$). Hence, there are $24-12=12$ arrangements with the blue and yellow houses non-adjacent.

By symmetry, exactly half of the $12$ arrangements have the blue house before the yellow house, and exactly half of those $6$ arrangements have the orange house before the red house, so our answer is $\cdot\frac{1}{2}\cdot\frac{1}{2}= \boxed{\textbf{(B) } 3}$
## Solution 3
To start with, the blue house is either the first or second house.

If the blue house is the first, then the orange must follow, leading to $2$ cases: $\text{B-O-R-Y}$ and $\text{B-O-Y-R}$.

If the blue house is second, then the orange house must be first and the yellow house last, leading to $1$ case: $\text{O-B-R-Y}$.
Therefore, our answer is $\boxed{\textbf{(B) } 3}$.

*~MathFun1000*
## Solution 4 (Complementary Counting)
We first count all the cases with the restrictions that B comes before Y and O comes before R. We have $4$ "slots" to choose from, and when we choose $2$ to be B and Y, the order for B and Y is automatically chosen. Also, O and R are also automatically chosen, so there are simply $\dbinom42=6$ total cases.

From here, the cases that don't work are the ones where B and Y are adjacent. BY can be treated as a single block; now, we have $3$ slots and $1$ thing to place, so there are $3$ of these cases.

Thus, this yields $6-3=3$ total cases. We are done.

*~Technodoggo*
## Video Solution (CREATIVE THINKING)
https://youtu.be/DsZBRhCtWvc

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/XR661k7tLCU

*~savannahsolver*
## See Also
