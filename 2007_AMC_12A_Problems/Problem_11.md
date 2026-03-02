# 2007 AMC 12A Problem 11

> This problem is the same as [2007 AMC 12A #11](https://artofproblemsolving.com/wiki/index.php/2007_AMC_12A_Problems) and [2007 AMC 10A #22](https://artofproblemsolving.com/wiki/index.php/2007_AMC_10A_Problems/Problem_22).
## Problem
A finite [sequence](https://artofproblemsolving.com/wiki/index.php/sequence) of three-digit integers has the property that the tens and units digits of each term are, respectively, the hundreds and tens digits of the next term, and the tens and units digits of the last term are, respectively, the hundreds and tens digits of the first term. For example, such a sequence might begin with the terms 247, 475, and 756 and end with the term 824. Let S be the sum of all the terms in the sequence. What is the largest [prime](https://artofproblemsolving.com/wiki/index.php/prime) [factor](https://artofproblemsolving.com/wiki/index.php/factor) that always divides S?


$$\mathrm{(A)}\ 3\qquad \mathrm{(B)}\ 7\qquad \mathrm{(C)}\ 13\qquad \mathrm{(D)}\ 37\qquad \mathrm{(E)}\ 43$$

## Solution
A given digit appears as the hundreds digit, the tens digit, and the units digit of a term the same number of times. Let k be the sum of the units digits in all the terms. Then S=$111k=3 \cdot 37$k, so S must be divisible by 37\ $\mathrm{(D)}.$ To see that it need not be divisible by any larger prime, the sequence 123, 231, 312 gives S=666=2 $\cdot 3^2 \cdot 37\Rightarrow \mathrm{\boxed{(D)~~37}}.$
## Solution 2 (Using the provided sequence/Guessing)
Since a prime number will always divide S, the prime number must work on any sequence that follows the stated rule. Since the solution kindly provides us with the terms 247,475,756,824,all we have to do is finish the sequence.

One way of finishing the sequence is by adding 568,682 (before 824) to the sequence and adding them all together. After this, we just divide the result by each of the answer choices. Of the five, 37 is the largest prime number that divides this sequence, so the answer is {$\boxed{(D)}$}.
*~Banspeedrun*
## Video Solution
https://www.youtube.com/watch?v=P-phdgVAQqI    ~David
## See also
