# 2020 AMC 12A Problem 5

> This problem is the same as [2020 AMC 12A #5](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12A_Problems) and [2020 AMC 10A #7](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10A_Problems).
## Problem
The $25$ integers from $-$10 to $14,$ inclusive, can be arranged to form a $5$-by-$5$ square in which the sum of the numbers in each row, the sum of the numbers in each column, and the sum of the numbers along each of the main diagonals are all the same. What is the value of this common sum?

$\textbf{(A) }2 \qquad\textbf{(B) } 5\qquad\textbf{(C) } 10\qquad\textbf{(D) } 25\qquad\textbf{(E) } 50$
## Solution 1
Without loss of generality, consider the five rows in the square. Each row must have the same sum of numbers, meaning that the sum of all the numbers in the square divided by $5$ is the total value per row. The sum of the $25$ integers is $-10+-9+...+14=11+12+13+14=50$, and the common sum is $\frac{50}{5}=\boxed{\text{(C) }10}$.
## Solution 2
Take the sum of the middle 5 values of the set (they will turn out to be the mean of each row). We get $0 + 1 + 2 + 3 + 4 = \boxed{\textbf{(C) } 10}$ as our answer.
*~Baolan*
## Solution 3
Taking the average of the first and last terms, $-10$ and $14$, we have that the mean of the set is $2$. There are 5 values in each row, column or diagonal, so the value of the common sum is $\cdot2$, or $\boxed{\textbf{(C) } 10}$.
*~Arctic_Bunny, edited by KINGLOGIC*
## Solution 4
Let us consider the horizontal rows.  Since there are five of them, each with constant sum $x$, we can add up the 25 numbers in 5 rows for a sum of $5x$.  Since the sum of the 25 numbers used is $\cdots{}+12+13+14+15=11+12+13+14+15=$50, $5x=50$ and $x=\boxed{\textbf{(C) }10}$.
*~cw357*
## Solution 5
The mean of the set of numbers is $(14-10) \div 2 = 2$. The numbers around it must be equal (i.e. if the mean of $1$, $2$, 3, $4$, and $5$ is $3$, then $2+4=1+5$.)
One row of the square would be


$$\square  \square  2  \square  \square$$


Adding the numbers would be


$$0, 1, 2, 3, 4$$


with a sum of $\boxed {\textbf {(C) }10}$.

<!-- Very bad and trivial solution :( -->
## Solution 6
If the sum of each row, column, and diagonal is x, then we have a total of $12x$ for the sum. The sum of the rows and columns is the sum of all the numbers doubled, which is $\cdot2=100$. Therefore $100+2x=$12x, $100=10x$, and $x=\boxed{10}$.
*~MC413551*
## Solution 7
A cool thing to find is that with magic squares, the smallest and largest number are either in the same row, column and diagonal to balance the equation out. To continue doing this, the other numbers in that same line form an arithmetic sequence. With our A term generally being 1, and our last term being $n^2.$ The $d =n+1$, by working out the a+$(n-1)$d formula. For a 5x5, $d = 6$. To apply this we start with A being -10, and our last term being 14. We increase by increments by 6 to get the 5 numbers in our line is -10, -4, 2, 8, 14. This adds up to $\boxed {\textbf {(C) }10}$.

(Note the goal of this solution was just to point out something I found that I thought was cool, I don't advise using it in actual competitions)

*~CubiksRube*
## Video Solution 1
Education, the Study of Everything

https://youtu.be/Zf4HCY-y5Z4
## Video Solution 2
https://youtu.be/JEjib74EmiY

*~IceMatrix*
[starts from 1.08 in the video]
## Video Solution 3
https://youtu.be/PHHBIiIlCY0

*~savannahsolver*
## Video Solution 4 by OmegaLearn
https://youtu.be/mgEZOXgIZXs?t=1

*~pi_is_3.14*
## See Also
