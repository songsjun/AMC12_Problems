# 2006 AMC 12B Problem 19

## Problem
Mr. Jones has eight children of different ages. On a family trip his oldest child, who is 9, spots a license plate with a 4-digit number in which each of two digits appears two times. "Look, daddy!" she exclaims. "That number is evenly divisible by the age of each of us kids!" "That's right," replies Mr. Jones, "and the last two digits just happen to be my age." Which of the following is not the age of one of Mr. Jones's children?


$$\mathrm{(A)}\ 4\qquad\mathrm{(B)}\ 5\qquad\mathrm{(C)}\ 6\qquad\mathrm{(D)}\ 7\qquad\mathrm{(E)}\ 8$$

## Solution
First, The number of the plate is divisible by 9 and in the form of
aabb, abba or abab.

We can conclude straight away that a+$b= 9$ using the 9 divisibility rule.

If $b=1$, the number is not divisible by 2 (unless it's 1818, which is not divisible by 4), which means there are no 2, 4, 6, or 8 year olds on the car, but that can't be true, as that would mean there are less than 8 kids on the car.

If $b=2$, then the only possible number is 7272. 7272 is divisible by 4, 6, and 8, but not by 5 and 7, so that doesn't work.

If $b=3$, then the only number is 6336, also not divisible by 5 or 7.

If $b=4$, the only number is 5544. It is divisible by 4, 6, 7, and 8.

Therefore, we conclude that the answer is  $\mathrm{(B)}$\ 5

**NOTE**: Automatically, since there are 8 children and all of their ages are less than or equal to 9 and are different, the answer choices can be narrowed down to 5 or 8.
## Alternate Solution
We know that the number of the plate is divisible by 9 and in the form aabb, abba, or abab for distinct digits a,b.

Using the divisibility rule for 9, we can conclude that $a+b\equiv 0\pmod{9}.$

We also know that the number of the plate is even, because you can only discard one number from the integers 1 through 9, inclusive (8 children, oldest is 9), and there's always going to be an even number left.

If one of the children was 5 years old, then the plate number would be divisible by both 5 and 2. Thus, the units digit must be 0.
Then, the possible form of the plate number would be aa00, 0bb0, or a0a0. The first case is not possible because 00 is not a possible age for the father.

We have the remaining forms 0bb0 and a0a0.

$\textbf{Case 1: 0bb0:}$
We know that $2b\equiv 0\pmod{9},$ so b has to be either 0 or 9. b can't be 0 because a, b are distinct. So, $b=9$. However, the number 0990 is not divisible by both 4 and 7, so whichever number you discard, the other one will still be there.  This creates a contradiction, so Case 1 cannot be true.

$\textbf{Case 2: a0a0:}$
Similarly to Case 1, we can determine that a has to be 9. However, the number 9090 is not divisible by both 4 and 7. Using the same logic in case 1, we conclude that Case 2 cannot be true.

Since we have disproven all of our cases, we know that it is impossible for one of the children to be  $\mathrm{(B)}$\ 5  years old.

**NOTE**: This might look tedious, but it only took me around 30 seconds to do on paper.
## See also
